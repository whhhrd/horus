import React, { Component } from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../state/state";
import { NotificationState } from "../../state/notifications/types";
import { getNotifications } from "../../state/notifications/selectors";
import Notification from "./Notification";

interface NotificationListProps {
    notifications: NotificationState[] | null;
}

/**
 * A notification wrapper that floats on top of the entire application.
 * Displays the notifications that reside in the global application state.
 */
class NotificationList extends Component<NotificationListProps> {
    render() {
        if (this.props.notifications == null) {
            return null;
        } else {
            return (
                <div className="NotificationsWrapper">
                    <div className="NotificationsBody">
                        {this.props.notifications.map(
                            (notification: NotificationState) => {
                                return (
                                    <Notification
                                        notification={notification}
                                        key={notification.id}
                                    />
                                );
                            },
                        )}
                    </div>
                </div>
            );
        }
    }
}

export default connect(
    (state: ApplicationState) => ({
        notifications: getNotifications(state),
    }),
    {},
)(NotificationList);
