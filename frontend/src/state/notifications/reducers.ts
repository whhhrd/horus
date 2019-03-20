import { NotificationsState, NotificationState } from "./types";
import { NotificationAction } from "./actions";
import {
    NOTIFICATION_DISMISSED_ACTION,
    NOTIFICATION_REQUESTED_ACTION,
    NOTIFICATIONS_RESET_ACTION,
} from "./constants";
const initialState: NotificationsState = {
    notifications: [],
    nextId: 0,
};

export default function notificationsReducer(state: NotificationsState,
                                             action: NotificationAction): NotificationsState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case NOTIFICATIONS_RESET_ACTION:
            return initialState;
        case NOTIFICATION_DISMISSED_ACTION:
            return {
                notifications: state.notifications.filter((notification: NotificationState) =>
                    notification.id !== action.id),
                ...state,
            };
        case NOTIFICATION_REQUESTED_ACTION:
            const newNotifcations = state.notifications.slice(0);
            newNotifcations.push({
                message: action.message, id: state.nextId,
                kind: action.kind, fadeAway: action.fadeAway,
            });
            return {
                notifications: newNotifcations,
                nextId: state.nextId + 1,
            };
        default:
            return state;
    }
}
