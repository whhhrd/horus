import {
    CourseDtoSummary,
    CourseDtoFull,
    ParticipantDtoBrief,
} from "../../api/types";

export interface CoursesState {
    courses: CourseDtoSummary[] | null;
    coursesFull: CourseDtoFull[] | null;
    currentParticipant: ParticipantDtoBrief | null;
}
