import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { notificationDismissedAction } from '../../state/notifications/actions';
import { NotificationState } from '../../state/notifications/types';
import { NOTIFICATION_TIMEOUT } from '../../state/notifications/constants';

interface NotificationProps {
    notification: NotificationState
    dismissNotification: (id: number) => {
        type: string
    },
}

interface NotificationLocalState {
    visible: boolean;
}
var timerId = -1;
class Notification extends Component<NotificationProps, NotificationLocalState> {
    constructor(props: NotificationProps) {
        super(props);
        this.state = { visible: true };
    }
    public componentDidMount() {
        if (this.props.notification.fadeAway) {
            timerId = setTimeout(() => { this.setState({ visible: false }); this.props.dismissNotification(this.props.notification.id); }, NOTIFICATION_TIMEOUT);
        }
    }
    public componentWillUnmount() {
        if (this.props.notification.fadeAway) {
            clearTimeout(timerId);
        }
    }
    public render() {
        return <Alert isOpen={this.state.visible}
            toggle={() => {
                this.setState({ visible: false });
                this.props.dismissNotification(this.props.notification.id);
            }}
            color={this.props.notification.kind}>{this.props.notification.message} </Alert>
    }
}

export default connect(() => ({
}), {
        dismissNotification: (id: number) => notificationDismissedAction(id),
    })(Notification);