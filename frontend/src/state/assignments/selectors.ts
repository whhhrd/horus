import { ApplicationState } from "../state";

export const getAssignmentSets = (state: ApplicationState) => {
    return state.assignmentSets != undefined ? state.assignmentSets!.assignmentSetBriefs : null;
};

export const getAssignmentGroupSetsMappingDtos = (state: ApplicationState) => {
    return state.assignmentSets != undefined ? state.assignmentSets!.assignmentGroupSetsMappings : null;
};

export const getAssignmentSet = (state: ApplicationState, asid: number) => {
    const assignmentSets = state.assignmentSets != null ? state.assignmentSets!.assignmentSets : null;
    return assignmentSets != null ?
        (assignmentSets!.get(Number(asid)) !== undefined ?
            assignmentSets!.get(Number(asid))! : null) : null;
};
