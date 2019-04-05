import { Action } from "redux";

import {
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

import {
    CommentThreadDtoFull,
    CommentCreateDto,
    CommentUpdateDto,
    CommentThreadCreateDto,
    CommentDto,
} from "../../api/types";
import { EntityType } from "./types";

// COMMENT THREAD CREATE
export interface CommentThreadCreateAction extends Action<string> {
    readonly entityId: number;
    readonly entityType: EntityType;
    readonly commentThreadCreate: CommentThreadCreateDto;
}

export interface CommentThreadCreateSucceededAction extends Action<string> {
    readonly entityId: number;
    readonly entityType: EntityType;
    readonly commentThread: CommentThreadDtoFull;
}

export const commentThreadCreateRequestedAction = (
    entityId: number,
    entityType: EntityType,
    commentThreadCreate: CommentThreadCreateDto,
) => ({
    type: COMMENT_THREAD_CREATE_REQUESTED_ACTION,
    entityId,
    entityType,
    commentThreadCreate,
});

export const commentThreadCreateRequestSucceededAction = (
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull,
) => ({
    type: COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION,
    entityId,
    entityType,
    commentThread,
});

// COMMENT THREAD FETCH
export interface CommentThreadRequestedAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
}

export interface CommentThreadRequestSucceededAction extends Action<string> {
    readonly entityId: number;
    readonly entityType: EntityType;
    readonly commentThread: CommentThreadDtoFull;
}

export const commentThreadRequestedAction = (
    entityId: number,
    entityType: EntityType,
) => ({
    type: COMMENT_THREAD_REQUESTED_ACTION,
    entityId,
    entityType,
});

export const commentThreadRequestSucceededAction = (
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull,
) => ({
    type: COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION,
    entityId,
    entityType,
    commentThread,
});

// COMMENT CREATE
export interface CommentCreateRequestAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    commentCreate: CommentCreateDto;
}

export interface CommentCreateSucceededAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    commentThread: CommentThreadDtoFull;
}

export const commentCreateRequestedAction = (
    entityId: number,
    entityType: EntityType,
    commentCreate: CommentCreateDto,
) => ({
    type: COMMENT_CREATE_REQUESTED_ACTION,
    entityId,
    entityType,
    commentCreate,
});

export const commentCreateRequestSucceededAction = (
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull,
) => ({
    type: COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION,
    entityId,
    entityType,
    commentThread,
});

// COMMENT UPDATE
export interface CommentUpdateRequestAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    commentId: number;
    commentUpdate: CommentUpdateDto;
}

export interface CommentUpdateSucceededAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    commentThread: CommentThreadDtoFull;
}

export const commentUpdateRequestedAction = (
    entityId: number,
    entityType: EntityType,
    commentId: number,
    commentUpdate: CommentUpdateDto,
) => ({
    type: COMMENT_UPDATE_REQUESTED_ACTION,
    entityId,
    entityType,
    commentId,
    commentUpdate,
});

export const commentUpdateRequestSucceededAction = (
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull,
) => ({
    type: COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION,
    entityId,
    entityType,
    commentThread,
});

// COMMENT DELETE
export interface CommentDeleteRequestAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    comment: CommentDto;
}

export interface CommentDeleteSucceededAction extends Action<string> {
    entityId: number;
    entityType: EntityType;
    commentThread: CommentThreadDtoFull;
}

export const commentDeleteRequestedAction = (
    entityId: number,
    entityType: EntityType,
    comment: CommentDto,
) => ({
    type: COMMENT_DELETE_REQUESTED_ACTION,
    entityId,
    entityType,
    comment,
});

export const commentDeleteRequestSucceededAction = (
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull,
) => ({
    type: COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION,
    entityId,
    entityType,
    commentThread,
});
