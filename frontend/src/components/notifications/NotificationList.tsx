import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../state/state';
import { NotificationState } from '../../state/notifications/types';
import { getNotifications } from '../../state/notifications/selectors';
import Notification from './Notification';
interface NotificationListProps {
    notifications?: NotificationState[];
}

interface NotificationListState {
}

class NotificationList extends Component<NotificationListProps, NotificationListState> {

    public render() {
        if (this.props.notifications === undefined) {
            return null;
        }
        return (
            <div className="ErrorComponentWrapper">
                <div className="ErrorComponent">
                    {this.props.notifications.map((notification: NotificationState) => {
                        return <Notification notification={notification} key={notification.id} />
                    })}
                </div>{this.props.children}
            </div>);
    }

}
export default connect((state: ApplicationState) => ({
    notifications: getNotifications(state),
}), {
    })(NotificationList);