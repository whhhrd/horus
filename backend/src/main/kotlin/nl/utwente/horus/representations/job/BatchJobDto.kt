package nl.utwente.horus.representations.job

import nl.utwente.horus.representations.person.PersonDtoBrief
import nl.utwente.horus.services.job.BatchJob
import nl.utwente.horus.services.job.BatchJobStatus
import java.time.ZonedDateTime

data class BatchJobDto(
        val id: String,
        val description: String,
        val startedAt: ZonedDateTime,
        val issuer: PersonDtoBrief,
        val completedTasks: Int,
        val totalTasks: Int,
        val status: BatchJobStatus,
        val error: String?
) {
    constructor(job: BatchJob) : this(job.id, job.description, job.startedAt, job.issuer,
            job.progress.counts.first, job.progress.counts.second, job.status, job.errorMessage)
}