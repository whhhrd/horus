import { GroupSetDtoSummary, GroupDtoFull } from "../../api/types";

export interface GroupsState {
    groupSets: GroupSetDtoSummary[] | null;
    groups: GroupDtoFull[] | null;
}
