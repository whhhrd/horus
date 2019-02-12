package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.GroupSet

open class GroupSetDtoFull : GroupSetDtoSummary {
    val groups: MutableSet<GroupDtoBrief>

    constructor(gs: GroupSet) : super(gs) {
        this.groups = gs.groups.map { GroupDtoBrief(it) }.toMutableSet()
    }
}