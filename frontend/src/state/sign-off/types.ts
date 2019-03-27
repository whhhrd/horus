import {
    SignOffResultDtoCompact,
    AssignmentSetDtoFull,
    GroupDtoFull,
    SignOffResultDtoSummary, ParticipantDtoBrief, AssignmentDtoBrief,
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

export interface SignOffInformation {
    signedAt: Date;
    signer: ParticipantDtoBrief;
    type: string;
    student: ParticipantDtoBrief;
    assignment: AssignmentDtoBrief;
}
