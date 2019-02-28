import { GroupSetDtoSummary, GroupDtoFull } from "../types";

export interface GroupsState {
    groupSets: GroupSetDtoSummary[] | null;
    groups: GroupDtoFull[] | null;
}
