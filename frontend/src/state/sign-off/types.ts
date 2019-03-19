import {
    SignOffResultDtoCompact,
    AssignmentSetDtoFull,
    GroupDtoFull,
    SignOffResultDtoSummary,
} from "../../api/types";

export enum SignOffChangeResult {
    Sufficient,
    Insufficient,
    Unattempted,
}

export interface SignOffState {
    signOffs: SignOffDetails | null;
    signOffHistory: SignOffResultDtoSummary[] | null;
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
