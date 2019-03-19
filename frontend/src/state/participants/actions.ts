import {
    PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION,
    PARTICIPANTS_FETCH_REQUESTED_ACTION,
    COURSE_PARTICIPANTS_FETCH_REQUESTED_ACTION,
    COURSE_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import { Action } from "redux";
import { ParticipantDtoFull } from "../../api/types";

// FETCH PARTICIPANTS BY ID
export interface ParticipantsFetchAction extends Action<string> {
    readonly participantIds: number[];
}

export interface ParticipantsFetchSucceededAction extends Action<string> {
    readonly participants: ParticipantDtoFull[];
}

export const participantsFetchAction = (participantIds: number[]) =>
    ({ type: PARTICIPANTS_FETCH_REQUESTED_ACTION, participantIds });

export const participantsFetchSucceededAction = (participants: ParticipantDtoFull[]) =>
    ({ type: PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION, participants });

// FETCH PARTICIPANTS IN COURSE
export interface CourseParticipantsFetchAction extends Action<string> {
    readonly courseId: number;
}

export interface CourseParticipantsFetchSucceededAction extends Action<string> {
    readonly participants: ParticipantDtoFull[];
}

export const courseParticipantsFetchAction = (courseId: number) =>
    ({ type: COURSE_PARTICIPANTS_FETCH_REQUESTED_ACTION, courseId });

export const courseParticipantsFetchSucceededAction = (participants: ParticipantDtoFull[]) =>
    ({ type: COURSE_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION, participants });
