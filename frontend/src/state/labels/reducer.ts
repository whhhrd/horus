import {
    LabelCreateSucceededAction,
    LabelUpdateSucceededAction,
    LabelDeleteSucceededAction,
} from "./action";

import {
    LABEL_CREATE_SUCCEEDED_ACTION,
    LABEL_UPDATE_SUCCEEDED_ACTION,
    LABEL_DELETE_SUCCEEDED_ACTION,
} from "./constants";

import { Action } from "redux";
import { LabelsState } from "./types";
import {
    COURSE_REQUESTED_ACTION,
    COURSE_REQUEST_SUCCEEDED_ACTION,
} from "../courses/constants";
import { CourseRequestSucceededAction } from "../courses/action";

const initialState: LabelsState = {
    labels: null,
};

export default function labelsReducer(
    state: LabelsState,
    action: Action,
): LabelsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case COURSE_REQUESTED_ACTION:
            return {
                ...state,
                labels: null,
            };
        case COURSE_REQUEST_SUCCEEDED_ACTION:
            const course = (action as CourseRequestSucceededAction).course;
            return {
                ...state,
                labels: course.labels,
            };
        case LABEL_CREATE_SUCCEEDED_ACTION: {
            const label = (action as LabelCreateSucceededAction).label;
            const labels = state.labels != null ? state.labels.slice() : [];
            labels.push(label);

            return {
                ...state,
                labels,
            };
        }
        case LABEL_UPDATE_SUCCEEDED_ACTION: {
            const newLabel = (action as LabelUpdateSucceededAction).label;
            const labels = state.labels != null ? state.labels.slice() : [];

            if (labels.length > 0) {
                const label = labels.find((l) => l.id === newLabel.id);
                if (label != null) {
                    const labelIndex = labels.indexOf(label);
                    labels[labelIndex] = newLabel;
                } else {
                    labels.push(newLabel);
                }
            }

            return {
                ...state,
                labels,
            };
        }
        case LABEL_DELETE_SUCCEEDED_ACTION: {
            const deletedLabelId = (action as LabelDeleteSucceededAction)
                .labelId;
            const labels = state.labels != null ? state.labels.slice() : [];
            if (labels.length > 0) {
                const label = labels.find((l) => l.id === deletedLabelId);
                if (label != null) {
                    const labelIndex = labels.indexOf(label);
                    labels.splice(labelIndex, 1);
                }
            }

            return {
                ...state,
                labels,
            };
        }
        default:
            return state;
    }
}
