import { AssignmentSetDtoBrief } from "../../api/types";

export interface SearchState {
    searchResult: GroupAssignmentSetCombination[] | null;
}

export interface GroupAssignmentSetCombination {
    id: number;
    name: string;
    memberNames: string[];
    assignmentSet: AssignmentSetDtoBrief;
    // Used to indicate that this suggestion should be at the top of the search results
    important: boolean | null;
}
