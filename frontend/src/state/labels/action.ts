import { Action } from "redux";

import {
    LABEL_CREATE_ACTION,
    LABEL_CREATE_SUCCEEDED_ACTION,
    LABEL_UPDATE_ACTION,
    LABEL_UPDATE_SUCCEEDED_ACTION,
    LABEL_DELETE_SUCCEEDED_ACTION,
    LABEL_DELETE_ACTION,
    LABEL_MAPPING_CREATE_ACTION,
    LABEL_MAPPING_CREATE_SUCCEEDED_ACTION,
    LABEL_MAPPING_DELETE_ACTION,
    LABEL_MAPPING_DELETE_SUCCEEDED_ACTION,
    LABEL_CSV_UPLOAD_ACTION,
} from "./constants";
import { LabelDto, LabelCreateUpdateDto } from "../../api/types";

// CREATE LABEL
export interface LabelCreateAction extends Action<string> {
    courseId: number;
    labelCreate: LabelCreateUpdateDto;
}

export interface LabelCreateSucceededAction extends Action<string> {
    label: LabelDto;
}

export const labelCreateAction = (
    courseId: number,
    labelCreate: LabelCreateUpdateDto,
) => ({
    type: LABEL_CREATE_ACTION,
    courseId,
    labelCreate,
});

export const labelCreateSucceededAction = (label: LabelDto) => ({
    type: LABEL_CREATE_SUCCEEDED_ACTION,
    label,
});

// UPDATE LABEL
export interface LabelUpdateAction extends Action<string> {
    courseId: number;
    labelId: number;
    labelUpdate: LabelCreateUpdateDto;
}

export interface LabelUpdateSucceededAction extends Action<string> {
    label: LabelDto;
}

export const labelUpdateAction = (
    courseId: number,
    labelId: number,
    labelUpdate: LabelCreateUpdateDto,
) => ({
    type: LABEL_UPDATE_ACTION,
    courseId,
    labelId,
    labelUpdate,
});

export const labelUpdateSucceededAction = (label: LabelDto) => ({
    type: LABEL_UPDATE_SUCCEEDED_ACTION,
    label,
});

// DELETE LABEL
export interface LabelDeleteAction extends Action<string> {
    courseId: number;
    labelId: number;
}

export interface LabelDeleteSucceededAction extends Action<string> {
    labelId: number;
}

export const labelDeleteAction = (courseId: number, labelId: number) => ({
    type: LABEL_DELETE_ACTION,
    courseId,
    labelId,
});

export const labelDeleteSucceededAction = (labelId: number) => ({
    type: LABEL_DELETE_SUCCEEDED_ACTION,
    labelId,
});

// CREATE LABEL MAPPING
export interface LabelMappingCreateAction extends Action<string> {
    participantId: number;
    label: LabelDto;
}

export interface LabelMappingCreateSucceededAction extends Action<string> {
    participantId: number;
    label: LabelDto;
}

export const labelMappingCreateAction = (participantId: number, label: LabelDto) => ({
    type: LABEL_MAPPING_CREATE_ACTION,
    participantId,
    label,
});

export const labelMappingCreateSucceededAction = (participantId: number, label: LabelDto) => ({
    type: LABEL_MAPPING_CREATE_SUCCEEDED_ACTION,
    participantId,
    label,
});

// DELETE LABEL MAPPING
export interface LabelMappingDeleteAction extends Action<string> {
    participantId: number;
    label: LabelDto;
}

export interface LabelMappingDeleteSucceededAction extends Action<string> {
    participantId: number;
    label: LabelDto;
}

export const labelMappingDeleteAction = (participantId: number, label: LabelDto) => ({
    type: LABEL_MAPPING_DELETE_ACTION,
    participantId,
    label,
});

export const labelMappingDeleteSucceededAction = (participantId: number, label: LabelDto) => ({
    type: LABEL_MAPPING_DELETE_SUCCEEDED_ACTION,
    participantId,
    label,
});

// UPLOAD LABEL CSV
export interface LabelCsvUploadAction extends Action<string> {
    courseId: number;
    formData: FormData;
}

export const labelCsvUploadAction = (courseId: number, formData: FormData) => ({
    type: LABEL_CSV_UPLOAD_ACTION,
    courseId,
    formData,
});
