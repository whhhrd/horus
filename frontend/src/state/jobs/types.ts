import { BatchJobDto } from "../../api/types";

export interface JobsState {
    jobs: BatchJobDto[] | null;
}
