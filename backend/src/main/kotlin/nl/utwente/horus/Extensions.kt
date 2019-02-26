package nl.utwente.horus

import java.util.*

/**
 * Converts Optional<T> to a T?, allowing for use of Kotlin null-aware operators.
 */
fun <T> Optional<T>.unwrap(): T? = orElse(null)