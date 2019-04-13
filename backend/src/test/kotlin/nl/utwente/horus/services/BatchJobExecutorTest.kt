package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.exceptions.JobNotFoundException
import nl.utwente.horus.services.job.BatchJobExecutor
import nl.utwente.horus.services.job.BatchJobStatus
import nl.utwente.horus.services.job.JobProgress
import org.junit.After
import org.springframework.beans.factory.annotation.Autowired
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.atomic.AtomicInteger

class BatchJobExecutorTest : HorusAbstractTest() {

    val nonExistingJobId = "381391012301"
    val count = AtomicInteger(0)

    @Autowired
    private lateinit var batchJobExecutor: BatchJobExecutor

    @Before
    fun resetCount() {
        // Before every test, reset the count
        count.set(0)
    }

    @After
    @WithLoginId(PP_TEACHER_LOGIN)
    fun removeAllBatchJobs() {
        // After every test, all the batch jobs should be removed
        val jobs = batchJobExecutor.getBatchJobsByIssuer(getCurrentPerson().id)
        for (job in jobs) {
            while (!(job.status == BatchJobStatus.COMPLETED || job.status == BatchJobStatus.ABORTED)) {
                // Wait until the finished job is done or canceled
                Thread.sleep(255)
            }
            batchJobExecutor.removeBatchJob(job.id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobByIdOrNull() {
        val person = getCurrentPerson()
        val expectedJob = batchJobExecutor.startAddBatchJob("Job", person) { longRunningTask(it) }
        val actualJob = batchJobExecutor.getBatchJobByIdOrNull(expectedJob.id)
        assertEquals(expectedJob, actualJob)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobByIdOrNullNull() {
        val actualJob = batchJobExecutor.getBatchJobByIdOrNull(nonExistingJobId)
        assertEquals(null, actualJob)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobById() {
        val person = getCurrentPerson()
        val expectedJob = batchJobExecutor.startAddBatchJob("Job", person) { longRunningTask(it) }
        val actualJob = batchJobExecutor.getBatchJobById(expectedJob.id)
        assertEquals(expectedJob, actualJob)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobByIdNull() {
        assertThrows(JobNotFoundException::class) {
            batchJobExecutor.getBatchJobById(nonExistingJobId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobsByIssuer() {
        val person = getCurrentPerson()
        val expectedJob = batchJobExecutor.startAddBatchJob("Job", person) { longRunningTask(it) }
        val actualJobs = batchJobExecutor.getBatchJobsByIssuer(person.id)
        assertEquals(1, actualJobs.size)
        assertEquals(expectedJob, actualJobs[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetBatchJobsByIssuerNone() {
        val person = getCurrentPerson()
        val actualJobs = batchJobExecutor.getBatchJobsByIssuer(person.id)
        assertEquals(0, actualJobs.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testRemoveBatchJob() {
        val person = getCurrentPerson()
        val job = batchJobExecutor.startAddBatchJob("Job", person) { longRunningTask(it) }
        while (!(job.status == BatchJobStatus.COMPLETED || job.status == BatchJobStatus.ABORTED)) {
            // Wait until the batch job is finished or canceled
            Thread.sleep(255)
        }
        batchJobExecutor.removeBatchJob(job.id)
        val jobs = batchJobExecutor.getBatchJobsByIssuer(person.id)
        assertEquals(0, jobs.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testStartAddBatchJob() {
        val person = getCurrentPerson()
        val job = batchJobExecutor.startAddBatchJob("Job", person) { longRunningTask(it) }
        while (!(job.status == BatchJobStatus.COMPLETED || job.status == BatchJobStatus.ABORTED)) {
            // Wait until the batch job is finished or canceled
            Thread.sleep(255)
        }
        assertEquals(count.get(), 65535)
        val (completed, total) = job.progress.counts
        assertEquals(completed, total)
        assertTrue(total > 1) // Base value is 1 due to initial value
    }

    private fun longRunningTask(progress: JobProgress) {
        val counter = progress.newSubCounter()
        counter.totalTasks.set(65535)
        for (i in 1..65535) {
            count.incrementAndGet()
            counter.completedTasks.incrementAndGet()
        }
    }

}
