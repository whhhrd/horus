import { ParticipantsState } from "./types";
import {
    ParticipantsFetchAction,
    ParticipantsFetchSucceededAction,
    CourseParticipantsFetchSucceededAction,
    CourseStaffParticipantsFetchSucceededAction,
} from "./actions";
import {
    PARTICIPANTS_FETCH_REQUESTED_ACTION,
    PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION,
    COURSE_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION,
    COURSE_STAFF_PARTICIPANTS_FETCH_REQUESTED_ACTION,
    COURSE_STAFF_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import {
    LABEL_MAPPING_CREATE_SUCCEEDED_ACTION,
    LABEL_MAPPING_DELETE_SUCCEEDED_ACTION,
} from "../labels/constants";
import {
    LabelMappingCreateSucceededAction,
    LabelMappingDeleteSucceededAction,
} from "../labels/action";

const initialState: ParticipantsState = {
    participants: null,
    staff: null,
};

function participantsReducer(
    state: ParticipantsState,
    action:
        | ParticipantsFetchAction
        | ParticipantsFetchSucceededAction
        | LabelMappingCreateSucceededAction
        | LabelMappingDeleteSucceededAction
        | CourseStaffParticipantsFetchSucceededAction,
): ParticipantsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case PARTICIPANTS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                participants: null,
            };
        case PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION:
        case COURSE_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                participants: (action as
                    | ParticipantsFetchSucceededAction
                    | CourseParticipantsFetchSucceededAction).participants,
            };
        case LABEL_MAPPING_CREATE_SUCCEEDED_ACTION: {
            const {
                participantId,
                label,
            } = action as LabelMappingCreateSucceededAction;
            if (state.participants != null) {
                const participants = state.participants.slice();
                const participant = participants.find(
                    (p) => p.id === participantId,
                );
                if (participant != null) {
                    const participantIndex = participants.indexOf(participant);
                    const labels = participant.labels.slice();
                    labels.push(label);
                    participant.labels = labels;
                    participants[participantIndex] = participant;
                    return {
                        ...state,
                        participants,
                    };
                } else {
                    return state;
                }
            } else {
                return state;
            }
        }

        case LABEL_MAPPING_DELETE_SUCCEEDED_ACTION: {
            const {
                participantId,
                label,
            } = action as LabelMappingDeleteSucceededAction;
            if (state.participants != null) {
                const participants = state.participants.slice();
                const participant = participants.find(
                    (p) => p.id === participantId,
                );
                if (participant != null) {
                    const participantIndex = participants.indexOf(participant);
                    const labels = participant.labels;
                    const toBeRemovedLabel = labels.find(
                        (l) => l.id === label.id,
                    );
                    if (toBeRemovedLabel != null) {
                        const toBeRemovedLabelIndex = labels.indexOf(
                            toBeRemovedLabel,
                        );
                        labels.splice(toBeRemovedLabelIndex, 1);
                        participant.labels = labels;
                        participants[participantIndex] = participant;
                        return {
                            ...state,
                            participants,
                        };
                    } else {
                        return state;
                    }
                } else {
                    return state;
                }
            } else {
                return state;
            }
        }
        case COURSE_STAFF_PARTICIPANTS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                staff: null,
            };
        case COURSE_STAFF_PARTICIPANTS_FETCH_REQUEST_SUCCEEDED_ACTION:
            const staff = (action as CourseStaffParticipantsFetchSucceededAction)
                .participants;
            return {
                ...state,
                staff,
            };
        default:
            return state;
    }
}

export default participantsReducer;
