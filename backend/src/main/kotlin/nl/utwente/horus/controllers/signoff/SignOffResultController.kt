package nl.utwente.horus.controllers.signoff

import nl.utwente.horus.representations.assignment.SignOffResultDtoCompact
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@Transactional
@RequestMapping(path=["/api/signoff"])
class SignOffResultController {

    @Autowired
    lateinit var signOffService: SignOffService

    @PatchMapping(path = ["/{assignmentSetId}"])
    fun createSignOff(@PathVariable assignmentSetId: Long, @RequestBody dto: SignOffResultPatchDto): List<SignOffResultDtoCompact> {
        return signOffService.processSignOffs(dto, assignmentSetId).map { SignOffResultDtoCompact(it) }

    }
}