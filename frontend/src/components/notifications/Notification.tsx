import React, { Component } from "react";
import { connect } from "react-redux";

import { Alert } from "reactstrap";

import {
    NotificationState,
    NotificationKind,
} from "../../state/notifications/types";
import {
    notificationDismissedAction,
    NotificationDismissedAction,
} from "../../state/notifications/actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    IconDefinition,
    faTimesCircle,
    faInfoCircle,
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

interface NotificationProps {
    notification: NotificationState;
    dismissNotification: (id: number) => NotificationDismissedAction;
}

interface NotificationLocalState {
    visible: boolean;
}

/**
 * A notification that floats on top of the application, giving the user
 * useful information about the state and activity of the system.
 */
class Notification extends Component<
    NotificationProps,
    NotificationLocalState
> {
    static NOTIFICATION_TIMEOUT = 4000;

    timer: number;

    constructor(props: NotificationProps) {
        super(props);
        this.state = { visible: true };
        this.timer = -1;
    }

    componentDidMount() {
        if (this.props.notification.fadeAway) {
            this.timer = setTimeout(() => {
                this.setState((_) => ({ visible: false }));
                this.props.dismissNotification(this.props.notification.id);
            }, Notification.NOTIFICATION_TIMEOUT);
        }
    }

    componentWillUnmount() {
        if (this.props.notification.fadeAway) {
            clearTimeout(this.timer);
        }
    }

    render() {
        // Determine icon based on NotificationKind
        let icon: IconDefinition | null = null;
        switch (this.props.notification.kind) {
            case NotificationKind.Error:
                icon = faTimesCircle;
                break;
            case NotificationKind.Info:
                icon = faInfoCircle;
                break;
            case NotificationKind.Success:
                icon = faCheckCircle;
                break;
            case NotificationKind.Warning:
                icon = faExclamationCircle;
                break;
        }

        return (
            <Alert
                className="mt-4 mb-0"
                isOpen={this.state.visible}
                toggle={() => {
                    this.setState((_) => ({ visible: false }));
                    this.props.dismissNotification(this.props.notification.id);
                }}
                color={this.props.notification.kind}
            >
                <div className="p-2 d-flex flex-row">
                    <div>
                        <FontAwesomeIcon
                            className="mr-3"
                            icon={icon!}
                            size="3x"
                        />
                    </div>
                    <div className="my-auto">
                        <big>{this.props.notification.content}</big>
                    </div>
                </div>
            </Alert>
        );
    }
}

export default connect(
    () => ({}),
    {
        dismissNotification: (id: number) => notificationDismissedAction(id),
    },
)(Notification);
