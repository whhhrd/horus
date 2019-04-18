package nl.utwente.horus.services.job

import nl.utwente.horus.representations.person.PersonDtoBrief
import java.time.ZonedDateTime
import java.util.concurrent.ConcurrentLinkedDeque
import java.util.concurrent.atomic.AtomicInteger

/**
 * Function signature for a job call.
 * The JobProgress instance can be used to report progress to the user.
 */
typealias JobCall = (JobProgress) -> Unit

enum class BatchJobStatus {
    CREATED, PROCESSING, COMPLETED, ABORTED
}

class BatchJob {
    val id: String
    val description: String
    val startedAt: ZonedDateTime
    val issuer: PersonDtoBrief
    val job: JobCall
    val progress: JobProgress
    var status: BatchJobStatus
    var errorMessage: String?

    constructor(id: String, description: String, issuer: PersonDtoBrief, job: JobCall) {
        this.id = id
        this.description = description
        this.startedAt = ZonedDateTime.now()
        this.issuer = issuer
        this.job = job
        this.progress = JobProgress()
        this.status = BatchJobStatus.CREATED
        this.errorMessage = null
    }

    /**
     * Sets the job status to COMPLETED, and completes the default JobProgress counter.
     */
    fun markCompleted() {
        progress.markInitialCounterCompleted()
        status = BatchJobStatus.COMPLETED
    }
}

/**
 * Class used to expose and report the progress of a background job to the user.
 *
 * Works by means of different internal counters, which resemble the different "subjobs" of a long-running job.
 * The total progress is computed by adding up the completed/total counts of each of the subcounters.
 * This allows for creating a subcounter in the scope of a single function, instead of passing multiple counters around.
 *
 * There is a default counter with total 1, which completes when the whole job completes (incremented by parent BatchJob).
 *
 * This class uses thread-safe counters and data structures.
 */
class JobProgress {

    /**
     * Collection of counters associated to this Progress object.
     */
    private val counters: ConcurrentLinkedDeque<JobSubCounter> = ConcurrentLinkedDeque()

    constructor() {
        // Each job has a 0/1 counter to always have notion of being "completed"
        counters.add(JobSubCounter())
    }

    /**
     * Generates a new subcounter for this Progress object.
     */
    fun newSubCounter(): JobSubCounter {
        val result = JobSubCounter()
        counters.add(result)
        return result
    }

    fun markInitialCounterCompleted() {
        // Increment initial counter to truly "complete" task
        counters.first.completedTasks.incrementAndGet()
    }

    /**
     * Adds up all internal counters to get a total progress "score", which is a tuple of completed tasks
     * and total tasks.
     */
    val counts
        get() = counters
                .map { Pair(it.completedTasks.get(), it.totalTasks.get()) }
                .reduce { acc, pair -> Pair(acc.first + pair.first, acc.second + pair.second) }

}

/**
 * Subcounter which allows for keeping track of subjob progress.
 * The counters used are Atomic. They can be set and incremented in any desirable way, and these changes will
 * be reflected in the total progress of the whole Job.
 */
data class JobSubCounter(
        val completedTasks: AtomicInteger = AtomicInteger(0),
        val totalTasks: AtomicInteger = AtomicInteger(1)
)