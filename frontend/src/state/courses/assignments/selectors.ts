import { ApplicationState } from "../../state";
export const getAssignmentSetDtoBriefs = (state: ApplicationState) => {
    return state.assignmentSets != null ? state.assignmentSets!.assignmentSetDtoBriefs : null;
};

export const getAssignmentGroupSetsMappingDtos = (state: ApplicationState) => {
    return state.assignmentSets != null ? state.assignmentSets!.assignmentGroupSetsMappingDtos : null;
};

export const getError = (state: ApplicationState) => {
    return state.assignmentSets != null ? state.assignmentSets!.error : null;
};
