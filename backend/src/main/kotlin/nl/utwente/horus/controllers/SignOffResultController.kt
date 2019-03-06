package nl.utwente.horus.controllers

import nl.utwente.horus.representations.assignment.SignOffResultDtoCompact
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Transactional
@RequestMapping(path=["/api/signoff"])
class SignOffResultController {

    @PatchMapping(path = ["", "/"])
    fun createSignOff(@RequestBody dto: SignOffResultPatchDto): List<SignOffResultDtoCompact> {
        return emptyList()
    }
}