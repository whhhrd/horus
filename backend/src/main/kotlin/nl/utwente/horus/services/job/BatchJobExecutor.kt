package nl.utwente.horus.services.job

import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.JobNotFoundException
import nl.utwente.horus.exceptions.UndeletableJobException
import nl.utwente.horus.representations.person.PersonDtoBrief
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Executor to execute arbitrary functions in a background-thread, while still in a Transactional context.
 *
 * This allows for returning from an API call early, and reporting progress on the background task
 * via the different Progress handles.
 */
@Component
class BatchJobExecutor {

    @Autowired
    lateinit var executor: ThreadPoolTaskExecutor

    @Autowired
    lateinit var thisProxy: BatchJobExecutor

    companion object {
        val LOGGER = LoggerFactory.getLogger(BatchJobExecutor::class.java)
    }

    private val runningJobs = ConcurrentHashMap<String, BatchJob>()

    fun getBatchJobByIdOrNull(id: String): BatchJob? {
        return runningJobs[id]
    }

    fun getBatchJobById(id: String): BatchJob {
        return getBatchJobByIdOrNull(id) ?: throw JobNotFoundException()
    }

    fun getBatchJobsByIssuer(personId: Long): List<BatchJob> {
        return runningJobs.values.filter { it.issuer.id == personId }
    }

    /**
     * Removes batch job from registry.
     * This does not (and cannot) actually stop a running job, it will merely remove it from the bookkeeping.
     *
     * @throws UndeletableJobException When the removed job is still running.
     */
    fun removeBatchJob(id: String) {
        val job = getBatchJobById(id)
        if (job.status == BatchJobStatus.ABORTED || job.status == BatchJobStatus.COMPLETED) {
            runningJobs.remove(id)
        } else {
            throw UndeletableJobException()
        }
    }

    /**
     * Creates batch job to execute the given function in a Transactional context.
     *
     * @param description One-line job description of the function. Will be displayed to user.
     * @param issuer The user who started the given function. Will also be used as security-context in later calls.
     * @param job The function to execute in the background.
     */
    fun startAddBatchJob(description: String, issuer: Person, job: JobCall): BatchJob {
        // Create job object
        val uuid = UUID.randomUUID().toString()
        val batch = BatchJob(uuid, description, PersonDtoBrief(issuer), job)
        val security = SecurityContextHolder.getContext()
        runningJobs[uuid] = batch

        executor.submit { thisProxy.executeSingleJob(batch, security) }

        return batch
    }

    /**
     * Internal function to start a batch job. For bookkeeping purposes, use startAddBatchJob.
     */
    @Transactional
    fun executeSingleJob(batch: BatchJob, security: SecurityContext) {
        SecurityContextHolder.setContext(security)
        LOGGER.info("Starting job with UUID ${batch.id}")
        batch.status = BatchJobStatus.PROCESSING
        try {
            batch.job(batch.progress)
            LOGGER.info("Completed job with UUID ${batch.id}")
            // Increment "default" counter
            batch.markCompleted()
        } catch (e: Exception) {
            batch.status = BatchJobStatus.ABORTED
            batch.errorMessage = String.format("%s occurred: %s", e::class.simpleName!!, e.message)
            LOGGER.error("Error during executing job ${batch.id}", e)
        }
    }

}
