import { ApplicationState } from "../state";

export const getAnnouncements = (state: ApplicationState) =>
    state.queuing != null ? state.queuing.announcements : null;

export const getHistory = (state: ApplicationState) =>
    state.queuing != null ? state.queuing.history : null;

export const getQueues = (state: ApplicationState) =>
    state.queuing != null ? state.queuing.queues : null;

export const getCurrentParticipant = (state: ApplicationState) =>
    state.queuing != null ? state.queuing.participant : null;

export const getRoom = (state: ApplicationState) =>
    state.queuing != null ? state.queuing.room : null;
