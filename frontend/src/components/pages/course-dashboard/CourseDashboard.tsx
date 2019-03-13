import React, { Component } from "react";
import { Alert } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";
import { getCourseFull } from "../../../state/course-selection/selectors";
import { CourseDtoFull, AssignmentSetDtoBrief } from "../../../api/types";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { NOTIFICATION_ACTION_CONNECTOR } from "../../../state/notifications/constants";
import { NotificationProps } from "../../../state/notifications/types";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import CanvasCard from "../../CanvasCard";
import { courseRequestedAction } from "../../../state/course-selection/action";
import { buildContent } from "../../pagebuilder";

interface CourseDashboardProps {
    courseFull: (id: number) => CourseDtoFull | null;

    requestCourse: (id: number) => {
        type: string,
    };
}

class CourseDashboard extends Component<CourseDashboardProps & RouteComponentProps<any> & NotificationProps> {

    componentDidMount() {
        this.props.requestCourse(Number(this.props.match.params.cid));
    }

    render() {
        const course = this.props.courseFull(Number(this.props.match.params.cid));

        if (course == null) {
            return buildContent("Courses", null);
        } else {
            return buildContent(course.name, this.buildContent(course));
        }
    }

    buildContent(course: CourseDtoFull) {
        return (
            <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                {course.assignmentSets.length > 0 ?
                    course.assignmentSets.map((aSet: AssignmentSetDtoBrief) => {
                        return <CanvasCard
                            watermarkIcon={faTasks}
                            key={aSet.id}
                            cardTitle={aSet.name}
                            url={`/courses/${course.id}/assignmentset/${aSet.id}`} />;
                    }) :
                    <Col xs="12" lg="3">
                        <Alert className="text-center" color="info">Nothing to display here.</Alert>
                    </Col>}
            </Row>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    courseFull: (id: number) => getCourseFull(state, id),
}), {
        requestCourse: (id: number) => courseRequestedAction(id),
        ...NOTIFICATION_ACTION_CONNECTOR,
    })(CourseDashboard));
