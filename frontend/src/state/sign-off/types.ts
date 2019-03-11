import {
    SignOffResultDtoCompact,
    AssignmentSetDtoFull,
    GroupDtoFull,
} from "../../api/types";

export enum SignOffChangeResult {
    Sufficient,
    Insufficient,
    Unattempted,
}

export interface SignOffState {
    signOffs: SignOffDetails | null;
}

export interface SignOffDetails {
    signOffs: SignOffResultDtoCompact[];
    group: GroupDtoFull;
    assignmentSet: AssignmentSetDtoFull;
}

export interface SignOffChange {
    id: number | null;
    pid: number;
    aid: number;
    result: SignOffChangeResult;
    comment: string | null;
}
