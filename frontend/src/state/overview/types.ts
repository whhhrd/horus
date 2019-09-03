import { Action } from "redux";
import { GroupDtoFull, SignOffResultDtoCompact } from "../../api/types";
import { SignOffOverviewFilterQueryAction, SignOffOverviewFilterSucceededAction } from "./actions";

export interface SignOffOverviewFetchRequestedAction extends Action<string> {
    courseId: number;
    assignmentSetId: number;
}

export interface SignOffOverviewGroupsFetchPageSucceededAction
    extends Action<string> {
    groups: GroupDtoFull[];
    assignmentSetId: number;
    courseId: number;
    totalPages: number;
    pageNumber: number;
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

export interface SignOffOverviewGroupsPageProgress {
    total: number;
    loaded: number;
}
export interface SignOffOverviewState {
    groups: GroupDtoFull[];
    signOffResults: SignOffResultsMap;
    loading: boolean;
    progress: SignOffOverviewGroupsPageProgress;
}

export type SignOffOverviewAction =
    | SignOffOverviewFetchRequestedAction
    | SignOffOverviewFetchSucceededAction
    | SignOffOverviewGroupsFetchPageSucceededAction
    | SignOffOverviewResultsFetchRequestedAction
    | SignOffOverviewResultsFetchSucceededAction
    | SignOffOverviewFilterQueryAction
    | SignOffOverviewFilterSucceededAction;
