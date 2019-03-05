import React, { Component } from "react";
import { Alert } from "reactstrap";
import { connect } from "react-redux";
import { notificationDismissedAction } from "../../state/notifications/actions";
import { NotificationState, NotificationKind } from "../../state/notifications/types";
import { NOTIFICATION_TIMEOUT } from "../../state/notifications/constants";
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
    dismissNotification: (id: number) => {
        type: string,
    };
}

interface NotificationLocalState {
    visible: boolean;
}

let timerId = -1;

class Notification extends Component<NotificationProps, NotificationLocalState> {

    constructor(props: NotificationProps) {
        super(props);
        this.state = { visible: true };
    }

    componentDidMount() {
        if (this.props.notification.fadeAway) {
            timerId = setTimeout(() => {
                this.setState((_) => ({ visible: false }));
                this.props.dismissNotification(this.props.notification.id);
            }, NOTIFICATION_TIMEOUT);
        }
    }

    componentWillUnmount() {
        if (this.props.notification.fadeAway) {
            clearTimeout(timerId);
        }
    }

    render() {

        let icon: IconDefinition | undefined;
        switch (this.props.notification.kind) {
            case NotificationKind.Error: icon = faTimesCircle; break;
            case NotificationKind.Info: icon = faInfoCircle; break;
            case NotificationKind.Success: icon = faCheckCircle; break;
            case NotificationKind.Warning: icon = faExclamationCircle; break;
        }

        return (
            <Alert
                className="mt-4 mb-0"
                isOpen={this.state.visible}
                toggle={() => {
                    this.setState((_) => ({ visible: false }));
                    this.props.dismissNotification(this.props.notification.id);
                }}
                color={this.props.notification.kind}>
                <div className="p-2 d-flex flex-row">
                    <div>
                        <FontAwesomeIcon className="mr-3" icon={icon!} size="3x" />
                    </div>
                    <div className="my-auto">
                        <big>{this.props.notification.message}</big>
                    </div>
                </div>
            </Alert>
        );
    }
}

export default connect(() => ({
}), {
        dismissNotification: (id: number) => notificationDismissedAction(id),
    })(Notification);
