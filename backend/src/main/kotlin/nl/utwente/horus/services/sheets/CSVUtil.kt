package nl.utwente.horus.services.sheets

import org.apache.commons.csv.CSVRecord

fun parseRemainingRow(record: CSVRecord, precedingColumns: Int) : List<String> {
    // Accept both labels in different columns and split within a column by a comma
    return record.asSequence().drop(precedingColumns) // Drop preceding columns, such as loginID at start
            .filter { it.isNotBlank() }
            .map { it.split(",") }.flatten()
            .map { it.trim() }.toList()
}