import { CourseDtoSummary } from "../types";

export interface CoursesState {
    courses?: CourseDtoSummary[];
    error?: Error;
}
