import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto } from "../../types";

export interface AssignmentSetsState {
    assignmentSetDtoBriefs: AssignmentSetDtoBrief[] | null;
    assignmentGroupSetsMappingDtos: AssignmentGroupSetsMappingDto[] | null;
    error: Error | null;
}
