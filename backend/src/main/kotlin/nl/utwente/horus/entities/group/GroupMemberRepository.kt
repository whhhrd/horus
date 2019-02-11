package nl.utwente.horus.entities.group

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional
interface GroupMemberRepository: JpaRepository<GroupMember, GroupMember.GroupMemberId> {

}