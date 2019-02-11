package nl.utwente.horus.services.group

import nl.utwente.horus.entities.group.GroupRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class GroupService {

    @Autowired
    lateinit var groupRepository: GroupRepository

}