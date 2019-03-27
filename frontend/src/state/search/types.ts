import { AssignmentSetDtoBrief } from "../../api/types";

export interface SearchState {
    searchResult: GroupAssignmentSetCombination[] | null;
}

export interface GroupAssignmentSetCombination {
    id: number;
    name: string;
    memberNames: string[];
    assignmentSet: AssignmentSetDtoBrief;
}

export interface GroupAssignmentSetSection {
    assignmentSet: AssignmentSetDtoBrief;
    groupsAssignmentSetCombinations: GroupAssignmentSetCombination[];
    important: boolean;
}
