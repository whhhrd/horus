import { ApplicationState } from "../state";

export const getParticipants = (state: ApplicationState) => {
    return state.participants != null ? state.participants.participants : null;
};

export const getStaffParticipants = (state: ApplicationState) => {
    return state.participants != null ? state.participants.staff : null;
};

export const getParticipant = (state: ApplicationState, pid: number) => {
    const participants = getParticipants(state);
    const participant =
        participants != null ? participants.find((p) => p.id === pid) : null;
    return participant != null ? participant : null;
};
