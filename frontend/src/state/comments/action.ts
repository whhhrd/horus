import { Action } from "redux";

import {
    COMMENT_THREADS_REQUESTED_ACTION,
    COMMENT_THREADS_REQUEST_SUCCEEDED_ACTION,
    COMMENT_CREATE_REQUESTED_ACTION,
    COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_UPDATE_REQUESTED_ACTION,
    COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_CREATE_REQUESTED_ACTION,
    COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_REQUESTED_ACTION,
    COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION,
    COMMENT_DELETE_REQUESTED_ACTION,
    COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import { CommentThreadDtoFull, CommentCreateDto, CommentUpdateDto, CommentThreadCreateDto, CommentDto } from "../types";
import { CommentThreadType } from "../../components/comments/CommentThread";

// COMMENT THREAD CREATE
export interface CommentThreadCreateAction extends Action<string> {
    readonly linkedEntityId: number;
    readonly linkedEntityType: CommentThreadType;
    readonly commentThreadCreate: CommentThreadCreateDto;
}

export interface CommentThreadCreateSucceededAction extends Action<string> {
    readonly commentThread: CommentThreadDtoFull;
}

export const commentThreadCreateRequestedAction = (
    linkedEntityId: number,
    linkedEntityType: CommentThreadType,
    commentThreadCreate: CommentThreadCreateDto) =>
    ({ type: COMMENT_THREAD_CREATE_REQUESTED_ACTION, linkedEntityId, linkedEntityType, commentThreadCreate });

export const commentThreadCreateRequestSucceededAction = (commentThread: CommentThreadDtoFull) =>
    ({ type: COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION, commentThread });

// COMMENT THREADS FETCH
export interface CommentThreadsRequestedAction extends Action<string> {
    readonly ctids: number[];
}

export interface CommentThreadsRequestSucceededAction extends Action<string> {
    readonly commentThreads: CommentThreadDtoFull[];
}

export const commentThreadsRequestedAction = (ctids: number[]) =>
    ({ type: COMMENT_THREADS_REQUESTED_ACTION, ctids });

export const commentThreadsRequestSucceededAction = (commentThreads: CommentThreadDtoFull[]) =>
    ({ type: COMMENT_THREADS_REQUEST_SUCCEEDED_ACTION, commentThreads });

// COMMENT THREAD FETCH
export interface CommentThreadRequestedAction extends Action<string> {
    readonly ctid: number;
}

export interface CommentThreadRequestSucceededAction extends Action<string> {
    readonly commentThread: CommentThreadDtoFull;
}

export const commentThreadRequestedAction = (ctid: number) =>
    ({ type: COMMENT_THREAD_REQUESTED_ACTION, ctid });

export const commentThreadRequestSucceededAction = (commentThread: CommentThreadDtoFull) =>
    ({ type: COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION, commentThread });

// COMMENT CREATE
export interface CommentCreateRequestAction extends Action<string> {
    readonly commentCreate: CommentCreateDto;
}

export interface CommentCreateSucceededAction extends Action<string> {
    readonly comment: CommentDto;
}

export const commentCreateRequestedAction = (commentCreate: CommentCreateDto) =>
    ({ type: COMMENT_CREATE_REQUESTED_ACTION, commentCreate });

export const commentCreateRequestSucceededAction = (comment: CommentDto) =>
    ({ type: COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION, comment });

// COMMENT UPDATE
export interface CommentUpdateRequestAction extends Action<string> {
    readonly commentID: number;
    readonly commentUpdate: CommentUpdateDto;
}

export interface CommentUpdateSucceededAction extends Action<string> {
    readonly comment: CommentDto;
}

export const commentUpdateRequestedAction = (commentID: number, commentUpdate: CommentUpdateDto) =>
    ({ type: COMMENT_UPDATE_REQUESTED_ACTION, commentID, commentUpdate });

export const commentUpdateRequestSucceededAction = () =>
    ({ type: COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION });

// COMMENT DELETE
export interface CommentDeleteRequestAction extends Action<string> {
    readonly comment: CommentDto;
}

export interface CommentDeleteSucceededAction extends Action<string> {
    readonly comment: CommentDto;
}

export const commentDeleteRequestedAction = (comment: CommentDto) =>
    ({ type: COMMENT_DELETE_REQUESTED_ACTION, comment });

export const commentDeleteRequestSucceededAction = (comment: CommentDto) =>
    ({ type: COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION, comment });
