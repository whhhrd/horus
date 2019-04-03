package nl.utwente.horus.services.job

import nl.utwente.horus.representations.person.PersonDtoBrief
import java.time.ZonedDateTime
import java.util.concurrent.ConcurrentLinkedDeque
import java.util.concurrent.atomic.AtomicInteger

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

    fun markCompleted() {
        progress.markInitialCounterCompleted()
        status = BatchJobStatus.COMPLETED
    }
}

class JobProgress {

    private val counters: ConcurrentLinkedDeque<JobSubCounter> = ConcurrentLinkedDeque()

    constructor() {
        // Each job has a 0/1 counter to always have notion of being "completed"
        counters.add(JobSubCounter())
    }

    fun newSubCounter(): JobSubCounter {
        val result = JobSubCounter()
        counters.add(result)
        return result
    }

    fun markInitialCounterCompleted() {
        // Increment initial counter to truly "complete" task
        counters.first.completedTasks.incrementAndGet()
    }

    val counts
        get() = counters
                .map { Pair(it.completedTasks.get(), it.totalTasks.get()) }
                .reduce { acc, pair -> Pair(acc.first + pair.first, acc.second + pair.second) }

}

data class JobSubCounter(
        val completedTasks: AtomicInteger = AtomicInteger(0),
        val totalTasks: AtomicInteger = AtomicInteger(1)
)