package nl.utwente.horus.controllers.person

import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.representations.auth.HorusAuthorityDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Transactional
@RestController
@RequestMapping("/api/persons")
class PersonController: BaseController() {

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping("/self/permissions")
    fun getSelfPermissions(): List<HorusAuthorityDto> {
        return userDetailService.getCurrentPerson().getAuthorities().map { HorusAuthorityDto(it) }
    }

}