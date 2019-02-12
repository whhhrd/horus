package nl.utwente.horus.controllers.assignment

import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path=["/api/assignments"])
@Transactional
class AssignmentController {

}