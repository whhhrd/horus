import { CourseDtoSummary, CourseDtoFull } from "../types";

export interface CoursesState {
    courses: CourseDtoSummary[] | null;
    coursesFull: CourseDtoFull[] | null;
}
