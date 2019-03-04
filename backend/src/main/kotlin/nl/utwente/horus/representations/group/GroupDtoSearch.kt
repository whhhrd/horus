package nl.utwente.horus.representations.group

class GroupDtoSearch {

    val id: Long
    val name: String
    val assignmentSetIds: List<Long>
    val memberNames: List<String>

    constructor(groupId: Long, name: String, assignmentSetIds: List<Long>, memberNames: List<String>) {
        this.id = groupId
        this.name = name
        this.memberNames = memberNames
        this.assignmentSetIds = assignmentSetIds
    }
}