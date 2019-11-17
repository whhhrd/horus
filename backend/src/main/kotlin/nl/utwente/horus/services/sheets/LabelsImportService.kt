package nl.utwente.horus.services.sheets

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.exceptions.InvalidSheetError
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.job.JobProgress
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.apache.commons.csv.CSVFormat
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.io.Reader
import java.util.*
import kotlin.collections.HashMap
import kotlin.collections.HashSet

@Transactional
@Component
class LabelsImportService {

    private data class LabelsRecord(val loginId: String, val labels: List<String>)

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var labelService: LabelService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var courseService: CourseService

    fun assignBulkLabels(csv: Reader, courseId: Long, wipeAll: Boolean, wipeOccurring: Boolean, progress: JobProgress? = null) {
        val course = courseService.getCourseById(courseId)
        val records = parseCsv(csv)

        if (wipeAll) {
            // Remove all existing label mappings in the Course
            participantService.removeLabelMappingsToParticipants(course.enabledAndDisabledParticipants)
        }
        val errors = LinkedList<String>()
        processRecords(records, course, wipeOccurring, errors, progress)
        if (errors.isNotEmpty()) {
            // Throw errors if they were found (reverting label assignment)
            throw InvalidSheetError(errors)
        }
    }

    private fun processRecords(allRecords: List<LabelsRecord>, course: Course, wipeOccurring: Boolean, errors: MutableList<String>, progress: JobProgress? = null) {
        // Build up Map from loginIds to list of Labels
        // This way, multiple lines with same login ID are merged
        val loginsToLabels = HashMap<String, MutableSet<String>>()
        allRecords.forEach {
            if (loginsToLabels.containsKey(it.loginId)) {
                loginsToLabels.getValue(it.loginId).addAll(it.labels)
            } else {
                loginsToLabels[it.loginId] = it.labels.toMutableSet()
            }
        }

        // Initialize counter based on expected # of login IDs to process (assuming no wrong login IDs in CSV)
        val counter = progress?.newSubCounter()
        counter?.totalTasks?.set(loginsToLabels.keys.size)

        val participations = participantService.getParticipationsInCourseByLoginId(loginsToLabels.keys, course.id)
        // Keep track of which participants were returned by above, since some could be in CSV but not in DB
        val seenIds = HashSet<String>()
        participations.forEach { part ->
            seenIds.add(part.person.loginId)
            counter?.completedTasks?.incrementAndGet()
            val labels = loginsToLabels.getValue(part.person.loginId)

            // Wipe existing labels if desired
            // Does not wipe previous CSV records, since they were merged in Map
            if (wipeOccurring) {
                part.labels.map { l -> participantService.removeLabelMapping(part, l) }
            }

            // Now assign labels
            for (labelName in labels) {
                val label = labelService.getLabelByName(course, labelName)
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
        // Find out if we skipped any loginIds from CSV
        if (seenIds.size != loginsToLabels.keys.size) {
            val missing = loginsToLabels.keys - seenIds
            errors.add("Student IDs not known in course: ${missing.joinToString()}")

            // Also correct counter
            counter?.totalTasks?.set(seenIds.size)
        }

    }

    private fun parseCsv(reader: Reader): List<LabelsRecord> {
        val records = CSVFormat.EXCEL.parse(reader)
        return records.map { record ->
            val loginId = record.get(0)
            LabelsRecord(loginId, parseRemainingRow(record, 1))
        }

    }
}