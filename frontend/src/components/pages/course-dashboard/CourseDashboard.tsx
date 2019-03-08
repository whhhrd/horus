import React, { Component } from "react";
import { Container } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";
import { getCourseFull } from "../../../state/course-selection/selectors";
import { CourseDtoFull, AssignmentSetDtoBrief } from "../../../state/types";
import { Spinner } from "reactstrap";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { NOTIFICATION_ACTION_CONNECTOR } from "../../../state/notifications/constants";
import { NotificationProps } from "../../../state/notifications/types";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import CanvasCard from "../../CanvasCard";
import Sidebar from "../../sidebar/Sidebar";
import CommentThread, { CommentThreadType } from "../../comments/CommentThread";
import { courseRequestedAction } from "../../../state/course-selection/action";

interface CourseDashboardProps {
    courseFull: (id: number) => CourseDtoFull | null;

    requestCourse: (id: number) => {
        type: string,
    };
}

class CourseDashboard extends Component<CourseDashboardProps & RouteComponentProps<any> & NotificationProps> {

    private spinner = <Spinner color="primary" type="grow" />;

    componentDidMount() {
        this.props.requestCourse(Number(this.props.match.params.cid));
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <Container fluid={true} style={{ flex: "auto" }}>
                    <Row className="main-body-breadcrumbs px-2 pt-3">
                        <Col md="12">
                            {this.headingText()}
                            <hr />
                        </Col>
                    </Row>
                    <Row className="main-body-display px-2">
                        <Col style={{ padding: 0 }}>
                            {this.buildContent()}
                        </Col>
                    </Row>
                </Container>
                <Sidebar>
                    {/* For Demo purposes */}
                    <CommentThread linkedEntityId={1}
                        linkedEntityType={CommentThreadType.Participant}
                        commentThreadId={175}
                        commentThreadSubject="Justin Praas"
                        showCommentThreadContent={true}
                        needToFetchThread={true} />
                    <CommentThread linkedEntityId={1}
                        linkedEntityType={CommentThreadType.Group}
                        commentThreadId={300}
                        commentThreadSubject="CP Group 1"
                        showCommentThreadContent={false}
                        needToFetchThread={true} />
                    <CommentThread linkedEntityId={1}
                        linkedEntityType={CommentThreadType.Assignment}
                        commentThreadId={140}
                        commentThreadSubject="Exercise 3"
                        showCommentThreadContent={false}
                        needToFetchThread={true} />
                    <CommentThread linkedEntityId={1}
                        linkedEntityType={CommentThreadType.Signoff}
                        commentThreadId={null}
                        commentThreadSubject="Assignment 5"
                        showCommentThreadContent={true}
                        needToFetchThread={true} />
                </Sidebar>
            </div>
        );
    }

    private headingText = () => {
        const course = this.props.courseFull(Number(this.props.match.params.cid));

        if (course === null) {
            return (
                <h3>
                    Loading {this.spinner}
                </h3>
            );
        } else {
            return (
                <div>
                    <h3>
                        {course.name}
                    </h3>
                </div>
            );
        }
    }
    private buildContent = () => {
        const course = this.props.courseFull(Number(this.props.match.params.cid));

        if (course === null) {
            return <div />;
        } else {
            return (
                <div className="card-collection" style={{ display: "flex", flexWrap: "wrap" }}>
                    {course.assignmentSets.map((aSet: AssignmentSetDtoBrief) => {
                        return <CanvasCard
                            watermarkIcon={faTasks}
                            key={aSet.id}
                            cardTitle={aSet.name}
                            url={`/courses/${course.id}/assignmentsets/${aSet.id}`} />;
                    })}
                </div>
            );
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    courseFull: (id: number) => getCourseFull(state, id),
}), {
        requestCourse: (id: number) => courseRequestedAction(id),
        ...NOTIFICATION_ACTION_CONNECTOR,
    })(CourseDashboard));
