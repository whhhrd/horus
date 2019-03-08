import { SignOffResultDtoCompact, AssignmentSetDtoFull, GroupDtoFull } from "../types";

export enum SignOff {
    Complete, Incomplete, Unattempted,
}
export interface SignOffState {
    remoteResults: SignOffDetails | null;
    localChanges: SignOffChange[] | null;
    saving: boolean;
}

export interface SignOffDetails {
    signOffs: SignOffResultDtoCompact[];
    group: GroupDtoFull;
    assignmentSet: AssignmentSetDtoFull;
}

export interface SignOffChange {
    pid: number;
    aid: number;
    result: SignOff;
    remoteId: number;
}
