import { Action } from "redux";

import {
    SIGN_OFF_SEARCH_QUERY_ACTION,
    SIGN_OFF_SEARCH_SUCCEEDED_ACTION,
} from "./constants";
import { GroupAssignmentSetSearchResultDto } from "../types";

export interface SignOffSearchQueryAction extends Action<string> {
    readonly courseID: number;
    readonly searchQuery: string;
}

export interface SignOffSearchSucceededAction extends Action<string> {
    readonly searchResult: GroupAssignmentSetSearchResultDto;
}

export const signOffSearchQueryAction = (courseID: number, searchQuery: string) =>
    ({ type: SIGN_OFF_SEARCH_QUERY_ACTION, courseID, searchQuery });
export const signOffSearchSucceededAction = (searchResult: GroupAssignmentSetSearchResultDto) =>
    ({ type: SIGN_OFF_SEARCH_SUCCEEDED_ACTION, searchResult });
