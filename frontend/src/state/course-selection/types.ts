import {CourseDtoFull, CourseDtoSummary} from "../types";

export interface CoursesState {
    courses?: CourseDtoSummary[];
    courseDtoFull?: CourseDtoFull;
}
