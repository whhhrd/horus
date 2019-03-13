import { Action } from "redux";
import { GroupDtoFull, SignOffResultDtoCompact } from "../../api/types";

export interface SignOffOverviewFetchRequestedAction extends Action<string> {
    courseId: number;
    assignmentSetId: number;
}

export interface SignOffOverviewGroupsFetchPageSucceededAction
    extends Action<string> {
    groups: GroupDtoFull[];
    assignmentSetId: number;
    courseId: number;
}

export interface SignOffOverviewFetchSucceededAction extends Action<string> {
    groups: GroupDtoFull[];
    assignmentSetId: number;
    courseId: number;
}

export interface SignOffOverviewResultsFetchRequestedAction
    extends Action<string> {
    assignmentSetId: number;
    courseId: number;
}

export interface SignOffOverviewResultsFetchSucceededAction
    extends Action<string> {
    assignmentSetId: number;
    courseId: number;
    results: SignOffResultDtoCompact[];
}

export type SignOffResultsMap = Map<number, Map<number, SignOffResultDtoCompact>>;

export interface SignOffOverviewState {
    groups: GroupDtoFull[];
    signOffResults: SignOffResultsMap;
    loading: boolean;
}

export type SignOffOverviewAction =
    | SignOffOverviewFetchRequestedAction
    | SignOffOverviewFetchSucceededAction
    | SignOffOverviewGroupsFetchPageSucceededAction
    | SignOffOverviewResultsFetchRequestedAction
    | SignOffOverviewResultsFetchSucceededAction;
