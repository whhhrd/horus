package nl.utwente.horus.controllers.jobs

import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.representations.job.BatchJobDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.job.BatchJobExecutor
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@Transactional
@RequestMapping(path=["/api/jobs"])
class JobController: BaseController() {

    @Autowired
    lateinit var batchJobExecutor: BatchJobExecutor

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/self"])
    fun getOwnJobsInfo(): List<BatchJobDto> {
        val personId = userDetailService.getCurrentPerson().id
        return batchJobExecutor.getBatchJobsByIssuer(personId).map { BatchJobDto(it) }
    }

    @GetMapping(path = ["/{jobId}"])
    fun getJobInfo(@PathVariable jobId: String): BatchJobDto {
        val job = batchJobExecutor.getBatchJobById(jobId)
        return BatchJobDto(job)
    }

    @DeleteMapping(path = ["/{jobId}"])
    fun deleteJob(@PathVariable jobId: String) {
        val job = batchJobExecutor.getBatchJobById(jobId)
        if (job.issuer.id != userDetailService.getCurrentPerson().id) {
            throw InsufficientPermissionsException()
        }
        batchJobExecutor.removeBatchJob(jobId)
    }
}
