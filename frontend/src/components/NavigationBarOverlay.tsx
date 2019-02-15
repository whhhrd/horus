import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../state/state';
import { getAssignmentSetDtoBriefs } from '../state/courses/assignments/selectors';
import { assignmentSetDtoBriefsFetchRequestedAction } from '../state/courses/assignments/actions';
import { AssignmentSetDtoBrief } from '../state/types';
import Row from 'reactstrap/lib/Row';

interface NavigationBarOverlayProps {
    assignmentSetDtoBriefs: AssignmentSetDtoBrief[] | null,

    fetchAssignmentSetDtoBriefs: (courseID: number) => {
        type: string
    }
}

interface NavigationBarOverlayState { }

class NavigationBarOverlay extends Component<NavigationBarOverlayProps, NavigationBarOverlayState> {

    componentDidMount() {
        // Fetch the assignment sets data
        this.props.fetchAssignmentSetDtoBriefs(20); // TODO: unhardcode course ID
    }

    public render() {
        if (this.props.assignmentSetDtoBriefs == null) { // If undefined, return an empty div
            return <div/>
        }

        const assignmentListEntries: JSX.Element[] = this.props.assignmentSetDtoBriefs.map((assignmentSetDtoBrief) =>
            <Row key={assignmentSetDtoBrief.id} className="px-4 py-1">
                <a href={"assignments/" + assignmentSetDtoBrief.id.toString()}>{assignmentSetDtoBrief.name}</a>
            </Row> );

        return (
            <div className="navigation-bar-overlay">
                <div className="p-4">
                    <h3>Sign-off Lists</h3>
                    <hr/>
                    {assignmentListEntries}
                </div>
            </div>

        );
    }
}

export default connect((state: ApplicationState) => ({
    assignmentSetDtoBriefs: getAssignmentSetDtoBriefs(state),
}), {
        fetchAssignmentSetDtoBriefs: assignmentSetDtoBriefsFetchRequestedAction,
    })(NavigationBarOverlay);