package nl.utwente.horus.services.sheets

import edu.ksu.canvas.model.Group
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.InvalidSheetError
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.canvas.CanvasService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.job.JobProgress
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.apache.commons.csv.CSVFormat
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.io.Reader
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@Transactional
@Component
class ImportService {

    private open class Record(
            val groupNum: String

    )

    private class StudentRecord(groupNum: String, val loginId: String, val labels: List<String>) : Record(groupNum)

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var canvasService: CanvasService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var labelService: LabelService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    companion object {
        const val GROUP_NUM_COL = 0
        const val S_NUM_COL = 1

        val STRING_COMPARATOR = kotlin.Comparator<String> { t1, t2 -> t2.length - t1.length }.then(Comparator.comparing(String::toString))
    }

    fun importCsv(csv: Reader, courseId: Long, categoryName: String, excessGroups: Int, progress: JobProgress? = null) {
        val course = courseService.getCourseById(courseId)

        // First do Canvas participants sync to update local DB and get Canvas IDs
        val users = canvasService.fetchCourseUsers(course)
        canvasService.processCourseUsers(course, users)
        val loginToCanvasIds = users.map { Pair(it.loginId, it.id) }.toMap()
        // Parse CSV from user
        val records = parseCsv(csv)
        val errors = LinkedList<String>()
        // Check CSV for correctness (contents), and assign labels (transactionally, so not yet "definitive")
        checkAssignLabels(records, course, errors)
        if (errors.isNotEmpty()) {
            // Throw errors if they were found (reverting label assignment)
            throw InvalidSheetError(errors)
        }
        // CSV should be good, upload to Canvas
        val author = participantService.getCurrentParticipationInCourse(course.id)
        uploadCanvasGroups(course, author, records, loginToCanvasIds, categoryName, excessGroups, progress)
    }

    private fun checkAssignLabels(allRecords: List<Record>, course: Course, errors: MutableList<String>) {
        val studentRecords = allRecords.filterIsInstance<StudentRecord>()
        val loginToRecords = studentRecords.map { Pair(it.loginId.trim(), it) }.toMap()
        // Possibility that login ID occurred twice, which isn't allowed.
        if (loginToRecords.keys.size != studentRecords.size) {
            val duplicates = studentRecords.groupBy { it.loginId }.filter { it.value.size > 1 }
            duplicates.forEach {entry ->
                errors.add("Login ID ${entry.key} occurs in multiple rows: " +
                        entry.value.joinToString { "'${it.loginId}, ${it.groupNum}, ${it.labels}'" })
            }
            return
        }
        // List of "seen" login IDs. Might be that some are in CSV which do not exist in real life
        val usedIds = HashSet<String>()
        participantService.getParticipationsInCourseByLoginId(loginToRecords.keys, course.id).forEach { part ->
            usedIds.add(part.person.loginId)
            val labels = loginToRecords.getValue(part.person.loginId).labels
            for (labelName in labels) {
                val label= labelService.getLabelByName(course, labelName)
                if (label == null) {
                    errors.add("Label '$labelName' wasn't found in this course.")
                    continue // Go on with next label/student, might find some more errors
                }
                // Only add if currently not assigned
                if (!part.labelMappings.any { it.label.id == label.id }) {
                    participantService.addLabel(part, label)
                }
            }
        }
        if (usedIds.size != loginToRecords.keys.size) {
            // Some student IDs weren't found in the Horus/Canvas course.
            val missing = loginToRecords.keys - usedIds
            errors.add("Student IDs not known in course: ${missing.joinToString()}")
            return
        }

        /*
        Note: we do not verify here if group names appear multiple times. They will simply only be created once, just as
        with empty group declarations being followed by students being in that group. A group-only record is simply seen
        as saying that a certain group should exist, irregardless of the number of students or the preceding records.
         */

    }

    private fun uploadCanvasGroups(course: Course, author: Participant, records: List<Record>, idMapping: Map<String, Int>,
                                   name: String, excessGroups: Int, progress: JobProgress? = null) {
        // Report progress via Progress-instance of BatchJob.
        // Each "unit" of counter is one completely uploaded group
        val counter = progress?.newSubCounter()
        val groups = records.groupBy { it.groupNum }.toSortedMap(STRING_COMPARATOR)
        val numGroups = groups.keys.size + excessGroups
        counter?.totalTasks?.set(numGroups)

        // Create category in Canvas, and save to DB
        // First calculate max group size (with minimum of 2, determined by Canvas)
        // Filter necessary to only count actual student inputs: declaring the same group 10 times should not result
        // in a max group size of 10
        val maxSize = Math.max(groups.maxBy { it.value.filterIsInstance<StudentRecord>().size }?.value?.size ?: 0, 2)
        val category = canvasService.createCanvasGroupCategory(course, name, 0, maxSize)
        val groupSet = canvasService.convertSaveCategory(course, category, author)
        val readerWriter = canvasService.getReaderWriter(course)

        // Upload individual groups to Canvas asynchronously, saving resulting groups for later processing (synchronously)
        // to the DB
        val resultGroups = ConcurrentHashMap<Group, Set<String>>()
        val executor = Executors.newFixedThreadPool(4)
        groups.forEach {(groupNum, groupRecords) -> executor.execute {
            val studentRecords = groupRecords.filterIsInstance<StudentRecord>()
            val group = readerWriter.createGroupInCategory("${category.name} $groupNum", category.groupCategoryId.toString())

            if (studentRecords.isEmpty()) {
                resultGroups[group] = emptySet()
            } else {
                canvasService.fillCanvasGroup(course, group.groupId.toString(), studentRecords.map { idMapping.getValue(it.loginId)})
                resultGroups[group] = studentRecords.map { it.loginId }.toSet()
            }

            counter?.completedTasks?.incrementAndGet()
        }
        }
        // Also add tasks to upload excess groups (which are not in CSV file, therefore not in records)
        (1..excessGroups).forEach { num -> executor.submit {
            val group = readerWriter.createGroupInCategory("${category.name} - Extra $num", category.groupCategoryId.toString())
            resultGroups[group] = emptySet() // No members for empty group
            counter?.completedTasks?.incrementAndGet()
        } }
        // Wait for all tasks to be completed
        executor.shutdown()
        executor.awaitTermination(Long.MAX_VALUE, TimeUnit.SECONDS)

        // Now synchronous again, save to DB
        resultGroups.forEach {(canvasGroup, loginIds) ->
            canvasService.saveCanvasGroup(canvasGroup, groupSet, author, loginIds)
        }

    }

    private fun parseCsv(reader: Reader): List<Record> {
        val records = CSVFormat.EXCEL.parse(reader)
        return records.map { record ->
            val size = record.size()
            val groupNum = record.get(GROUP_NUM_COL)

            if (size == 1 || record.get(S_NUM_COL).isBlank()) {
                Record(groupNum)
            } else {
                val loginId = record.get(S_NUM_COL)
                // Accept both labels in different columns and split within a column by a comma
                val labels = record.asSequence().drop(2) // Remove both s-number and group number, since they're both not labels
                        .filter { it.isNotBlank() }
                        .map { it.split(",") }.flatten()
                        .map { it.trim() }.toList()
                StudentRecord(loginId, groupNum, labels)
            }
        }

    }

}