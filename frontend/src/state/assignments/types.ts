import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto, AssignmentSetDtoFull } from "../types";

export interface AssignmentSetsState {
    assignmentSetBriefs: AssignmentSetDtoBrief[] | null;
    assignmentGroupSetsMappings: AssignmentGroupSetsMappingDto[] | null;
    assignmentSets: Map<number, AssignmentSetDtoFull> | null;
    deleteCheck: AssignmentValue[] | null;
    deleteOK: boolean;
}
export interface AssignmentValue {
    id: number;
    name: string;
}
