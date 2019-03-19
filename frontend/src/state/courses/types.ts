import { CourseDtoSummary, CourseDtoFull } from "../../api/types";

export interface CoursesState {
    courses: CourseDtoSummary[] | null;
    coursesFull: CourseDtoFull[] | null;
}
