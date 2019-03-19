package nl.utwente.horus.services.sheets

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.EmptyListException
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.signoff.SignOffService
import org.apache.poi.ss.usermodel.ComparisonOperator
import org.apache.poi.ss.usermodel.IndexedColors
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.xssf.usermodel.XSSFRow
import org.apache.poi.xssf.usermodel.XSSFSheet
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.*
import java.util.stream.Stream
import kotlin.collections.HashMap
import kotlin.math.max

@Transactional
@Component
class ExportService {

    private class Counter {
        private var value: Int

        constructor() : this(0)

        constructor(start: Int) {
            this.value = start
        }

        fun nextValue(): Int = value++
    }

    companion object {
        const val COMPLETE_STR = "C"
        const val INCOMPLETE_STR = "I"

        const val S_NUM_COL = 0
        const val NAME_COL = 1
        const val GROUP_ID_COL = 2
        const val GROUP_NAME_COL = 3

        const val STICKY_COLS = 4
        const val STICKY_ROWS = 1
    }

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var courseService: CourseService

    fun createCourseBook(course: Course): XSSFWorkbook {
        val book = XSSFWorkbook()
        addPeopleSheet(participantService.getCourseParticipationsStream(course), book.createSheet("Students"))
        addAssignmentSetSheets(course.assignmentSets.map { it.id }, book)
        return book
    }

    fun createAssignmentSetsBook(ids: List<Long>): XSSFWorkbook {
        if (ids.isEmpty()) {
            throw EmptyListException()
        }
        val book = XSSFWorkbook()
        addAssignmentSetSheets(ids, book)
        return book
    }

    private fun addPeopleSheet(participants: Stream<Participant>, sheet: XSSFSheet) {
        val counter = nextCounter(Counter())
        val header = listOf("Login ID", "Name (sortable)", "Name (full)", "Email", "Labels")
        appendInRow(sheet.createRow(counter()), header)
        participants.filter { it.role.id == 1L }.forEach { participant ->
            val person = participant.person
            val labels = participant.labels.joinToString { label -> label.name }
            val contents = listOf(person.loginId, person.sortableName, person.fullName, person.email ?: "", labels)
            appendInRow(sheet.createRow(counter()), contents)
        }
        sheet.createFreezePane(0, 1)
        for (i in 0 until header.size) {
            sheet.autoSizeColumn(i)
        }
    }

    private fun addAssignmentSetSheets(ids: List<Long>, book: XSSFWorkbook): XSSFWorkbook {
        ids.forEach { id ->
            val set = assignmentService.getAssignmentSetById(id)
            val sheet = book.createSheet(set.name)
            fillAssignmentSetSheet(sheet, set)
        }
        return book
    }

    private fun fillAssignmentSetSheet(sheet: XSSFSheet, set: AssignmentSet) {
        val participants = formParticipantGroupMap(set.id)
        // Variables to keep track of current row/column
        // Style to build sheet is like "typewriter": build row by row
        val counter = nextCounter(Counter())

        // Add header row
        fillHeaderRow(sheet.createRow(counter()), set)
        // Fill row for each participant
        val results = signOffService.getAssignmentSetSignOffResults(set)
        val resultsMap = HashMap<Participant, MutableList<SignOffResult>>()
        results.forEach {
            val participant = it.participant
            resultsMap.putIfAbsent(participant, LinkedList())
            resultsMap[participant]!!.add(it)
        }

        participants.forEach { fillParticipantRow(sheet.createRow(counter()), set, it.key, it.value, resultsMap[it.key] ?: emptyList()) }

        // Some layout tweaking
        val assignmentStartCol = STICKY_COLS
        val assignmentEndCol = STICKY_COLS + set.assignments.size
        sheet.createFreezePane(STICKY_COLS, STICKY_ROWS)  // Sticky rows/columns
        for (i in assignmentStartCol..assignmentEndCol) {
            sheet.autoSizeColumn(i)
        }
        // Do some auto-formatting of the assignment region
        val formatting = sheet.sheetConditionalFormatting

        val completeRule = formatting.createConditionalFormattingRule(
                ComparisonOperator.EQUAL, "\"$COMPLETE_STR\"")
        val greenFormatting = completeRule.createPatternFormatting()
        greenFormatting.fillBackgroundColor = IndexedColors.LIGHT_GREEN.index

        val incompleteRule = formatting.createConditionalFormattingRule(
                ComparisonOperator.EQUAL, "\"$INCOMPLETE_STR\"")
        val redFormatting = incompleteRule.createPatternFormatting()
        redFormatting.fillBackgroundColor = IndexedColors.LIGHT_ORANGE.index

        val regions = arrayOf(CellRangeAddress(STICKY_ROWS,
                STICKY_ROWS + participants.size, assignmentStartCol, assignmentEndCol))
        formatting.addConditionalFormatting(regions, completeRule, incompleteRule)

    }

    private fun fillHeaderRow(row: XSSFRow, set: AssignmentSet) {
        val contents = listOf("S-number", "Name", "Group-ID", "Group name") +
                set.assignments.map { it.name }
        appendInRow(row, contents)
    }

    private fun fillParticipantRow(row: XSSFRow, set: AssignmentSet, participant: Participant, group: Group, results: List<SignOffResult>) {
        val person = participant.person
        val preCells = listOf(person.loginId, person.sortableName, group.id.toString(), group.name)
        appendInRow(row, preCells)

        if (results.isEmpty()) {
            return // No more of row to fill
        }

        val postCells = LinkedList<SignOffResultType?>()
        val assignmentIterator = set.assignments.iterator()
        val resultsIterator = results.iterator()
        var result = resultsIterator.next()
        while (assignmentIterator.hasNext()) {
            val assignment = assignmentIterator.next()
            if (assignment.id == result.assignment.id) {
                // This is correct assignment
                postCells.add(result.result)
                if (resultsIterator.hasNext()) {
                    result = resultsIterator.next() // Advance assignment
                } else {
                    break // No more results to process
                }
            } else {
                // Results was for somewhere in next assignment
                postCells.add(null)
            }
        }
        appendInRow(row, postCells.map(this::resultToString))
    }

    private fun resultToString(r: SignOffResultType?): String {
        if (r == null) {
            return ""
        }
        if (r == SignOffResultType.COMPLETE) {
            return COMPLETE_STR
        } else {
            return INCOMPLETE_STR
        }
    }

    private fun formParticipantGroupMap(assignmentSetId: Long): SortedMap<Participant, Group> {
        val map = TreeMap<Participant, Group> { p1, p2 -> p1.person.sortableName.compareTo(p2.person.sortableName)}
        groupService.getGroupsByAssignmentSetId(Pageable.unpaged(), assignmentSetId).forEach {g ->
            g.participants.forEach { p -> map.put(p, g) }
        }
        return map
    }

    private fun appendInRow(row: XSSFRow, contents: List<String>) {
        val startNum = max(0, row.lastCellNum.toInt()) // Value is -1 if no rows exist yet...
        val next = nextCounter(Counter(startNum))
        contents.forEach {
            val cell = row.createCell(next())
            cell.setCellValue(it)
        }
    }

    private fun nextCounter(c: Counter): (() -> Int) = { c.nextValue() }
}