package nl.utwente.horus

import org.springframework.core.env.Environment
import java.util.*

/**
 * Converts Optional<T> to a T?, allowing for use of Kotlin null-aware operators.
 */
fun <T> Optional<T>.unwrap(): T? = orElse(null)

/**
 * Checks if the Production Spring profile is active in the environment
 */
fun Environment.isProductionActive(): Boolean = activeProfiles.contains("production")