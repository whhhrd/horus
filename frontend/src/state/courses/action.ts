import { Action } from "redux";

import {
    COURSES_REQUESTED_ACTION,
    COURSES_REQUEST_SUCCEEDED_ACTION,
    COURSE_REQUESTED_ACTION,
    COURSE_REQUEST_SUCCEEDED_ACTION,
    CURRENT_PARTICIPANT_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import {
    CourseDtoSummary,
    CourseDtoFull,
    ParticipantDtoBrief,
} from "../../api/types";

// REQUEST COURSES
export interface CoursesRequestedAction extends Action<string> {
    readonly id: number;
}

export interface CoursesRequestSucceededAction extends Action<string> {
    readonly courses: CourseDtoSummary[];
}

export const coursesRequestedAction = () => ({
    type: COURSES_REQUESTED_ACTION,
});

export const coursesRequestSucceededAction = (courses: CourseDtoSummary[]) => ({
    type: COURSES_REQUEST_SUCCEEDED_ACTION,
    courses,
});

// REQUEST COURSE
export interface CourseRequestedAction extends Action<string> {
    readonly id: number;
}

export interface CourseRequestSucceededAction extends Action<string> {
    readonly course: CourseDtoFull;
}

export const courseRequestedAction = (id: number) => ({
    type: COURSE_REQUESTED_ACTION,
    id,
});

export const courseRequestSucceededAction = (course: CourseDtoFull) => ({
    type: COURSE_REQUEST_SUCCEEDED_ACTION,
    course,
});

// REQUEST CURRENT PARTICIPANT
export interface CurrentParticipantRequestedAction extends Action<string> {
    cid: number;
}

export interface CurrentParticipantReceivedAction extends Action<string> {
    readonly currentParticipant: ParticipantDtoBrief;
}

export const currentParticipantRequestedAction = (cid: number) => ({
    type: CURRENT_PARTICIPANT_REQUESTED_ACTION,
    cid,
});

export const currentParticipantReceivedAction = (
    currentParticipant: ParticipantDtoBrief,
) => ({ type: CURRENT_PARTICIPANT_REQUEST_SUCCEEDED_ACTION, currentParticipant });
