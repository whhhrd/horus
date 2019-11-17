package nl.utwente.horus.services.sheets

import edu.ksu.canvas.model.Group
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.InvalidSheetError
import nl.utwente.horus.services.canvas.CanvasService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.job.JobProgress
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
import kotlin.math.max
import kotlin.streams.toList

@Transactional
@Component
class GroupsImportService {

    private class GroupRecord(val groupNum: String, val loginIds: List<String>)

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var canvasService: CanvasService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var courseService: CourseService

    companion object {
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
        // Check CSV for correctness (contents)
        checkValidity(records, course, errors)
        if (errors.isNotEmpty()) {
            // Throw errors if errors occurred during processing
            throw InvalidSheetError(errors)
        }
        // CSV should be good, upload to Canvas
        val author = participantService.getCurrentParticipationInCourse(course.id)
        uploadCanvasGroups(course, author, records, loginToCanvasIds, categoryName, excessGroups, progress)
    }

    private fun checkValidity(allRecords: List<GroupRecord>, course: Course, errors: MutableList<String>) {
        // Need to check two things: no loginID occurs twice, and all loginIDs must be in course
        val loginIdsList = allRecords.map { it.loginIds }.flatten()
        val loginIdsSet = loginIdsList.toSet()
        if (loginIdsList.size != loginIdsSet.size) {
            val duplicates = loginIdsList.groupBy { it }.filter { it.value.size > 1 }
            duplicates.forEach {entry ->
                errors.add("Login ID ${entry.key} occurs in multiple rows.")
            }
        }
        // Check which IDs actually occur in DB
        val courseIds = participantService.getParticipationsInCourseByLoginId(loginIdsSet, course.id).map {
            it.person.loginId
        }.toList()
        if (courseIds.size != loginIdsSet.size) {
            val missing = loginIdsSet - courseIds
            missing.forEach { errors.add("Login ID $it was not found in this course.") }
        }

        /*
        Note: we do not verify here if group names appear multiple times. They will simply only be created once, just as
        with empty group declarations being followed by students being in that group. A group-only record is simply seen
        as saying that a certain group should exist, irregardless of the number of students or the preceding records.
         */

    }

    private fun uploadCanvasGroups(course: Course, author: Participant, records: List<GroupRecord>, idMapping: Map<String, Int>,
                                   name: String, excessGroups: Int, progress: JobProgress? = null) {
        // Report progress via Progress-instance of BatchJob.
        // Each "unit" of counter is one completely uploaded group
        val counter = progress?.newSubCounter()
        val groups = records.groupBy { it.groupNum }
                .mapValues { it.value.map { r -> r.loginIds }.flatten().toSet() }.toSortedMap(STRING_COMPARATOR)
        val numGroups = groups.keys.size + excessGroups
        counter?.totalTasks?.set(numGroups)

        // Create category in Canvas, and save to DB
        // First calculate max group size (with minimum of 2, determined by Canvas)
        // Filter necessary to only count actual student inputs: declaring the same group 10 times should not result
        // in a max group size of 10
        val maxSize = max(groups.maxBy { it.value.size }?.value?.size ?: 0, 2)
        val category = canvasService.createCanvasGroupCategory(course, name, 0, maxSize)
        val groupSet = canvasService.convertSaveCategory(course, category, author)
        val readerWriter = canvasService.getReaderWriter(course)

        // Upload individual groups to Canvas asynchronously, saving resulting groups for later processing (synchronously)
        // to the DB
        val resultGroups = ConcurrentHashMap<Group, Set<String>>()
        val executor = Executors.newFixedThreadPool(4)
        groups.forEach {(groupNum, members) -> executor.execute {
            val group = readerWriter.createGroupInCategory("${category.name} $groupNum", category.groupCategoryId.toString())

            if (members.isEmpty()) {
                resultGroups[group] = emptySet()
            } else {
                canvasService.fillCanvasGroup(course, group.groupId.toString(), members.map { idMapping.getValue(it)})
                resultGroups[group] = members
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

    private fun parseCsv(reader: Reader): List<GroupRecord> {
        val records = CSVFormat.EXCEL.parse(reader)
        return records.map { record ->
            val groupNum = record.get(0)
            GroupRecord(groupNum, parseRemainingRow(record, 1))
        }

    }

}