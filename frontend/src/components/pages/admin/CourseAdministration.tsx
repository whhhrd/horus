import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";
import { getCurrentAccessToken } from "../../../api";

import { Link } from "react-router-dom";
import { buildContent } from "../../pagebuilder";
import { Row, Col } from "reactstrap";
import CoursePermissions from "../../../api/permissions";
import { getCoursePermissions } from "../../../state/auth/selectors";
import { ApplicationState } from "../../../state/state";
import {
    assignmentSetsAnyList,
    groupSetsAnyList,
    canViewListLabels,
    canExportData,
    suppRolesAnyView,
    participantsAdmin,
} from "../../../state/auth/constants";
import {
    CourseRequestedAction,
    courseRequestedAction,
} from "../../../state/courses/action";
import { CourseDtoSummary } from "../../../api/types";
import { getCourse } from "../../../state/courses/selectors";
import {
    CanvasRefreshParticipantsRequestedAction,
    canvasRefreshParticipantsRequestedAction,
} from "../../../state/canvas-settings/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTasks,
    faUsers,
    faTags,
    faUsersCog,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";

interface CourseAdministrationProps {
    coursePermissions: CoursePermissions | null;

    course: (id: number) => CourseDtoSummary | null;
    fetchCourse: (id: number) => CourseRequestedAction;
    refreshParticipants: (
        courseId: number,
    ) => CanvasRefreshParticipantsRequestedAction;
}

class CourseAdministration extends PureComponent<
    CourseAdministrationProps & RouteComponentProps<any>
> {
    componentDidMount() {
        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        return buildContent("Course Administration", this.buildContent(), null);
    }

    buildContent() {
        const cid = this.props.match.params.cid;
        const permissions = this.props.coursePermissions!;
        const course = this.props.course(cid);

        const canListAssignmentSets = assignmentSetsAnyList.check(
            cid,
            permissions,
        );

        const canViewRoles = suppRolesAnyView.check(cid, permissions);
        const canListGroupSets = groupSetsAnyList.check(cid, permissions);
        const canExport = canExportData.check(cid, permissions);

        const canRefreshParticipants = participantsAdmin.check(
            cid,
            permissions,
        );

        const canViewListLabelManager = canViewListLabels.check(
            cid,
            permissions,
        );
        const accessToken = getCurrentAccessToken();

        return (
            <Row>
                <Col xs="12">
                    <div className="w-100 lead">
                        {canListAssignmentSets && (
                            <Link
                                to={`/courses/${cid}/administration/assignmentsets`}
                            >
                                <FontAwesomeIcon
                                    icon={faTasks}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Manage assignment sets
                            </Link>
                        )}
                        <br />
                        {canListGroupSets && (
                            <Link
                                to={`/courses/${cid}/administration/groupsets`}
                            >
                                <FontAwesomeIcon
                                    icon={faUsers}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Manage group sets
                            </Link>
                        )}
                        <br />
                        {canViewListLabelManager && (
                            <Link
                                to={`/courses/${
                                    this.props.match.params.cid
                                }/administration/labels`}
                            >
                                <FontAwesomeIcon
                                    icon={faTags}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Manage course labels
                            </Link>
                        )}
                        <br />
                        {canViewRoles && (
                            <Link
                                to={`/courses/${
                                    this.props.match.params.cid
                                }/administration/roles`}
                            >
                                <FontAwesomeIcon
                                    icon={faUsersCog}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Manage roles
                            </Link>
                        )}
                        <br />
                        {canExport && accessToken != null && (
                            <a
                                href={`/api/courses/${
                                    this.props.match.params.cid
                                }/export?token=${accessToken}`}
                                target="_blank"
                            >
                                <FontAwesomeIcon
                                    icon={faDownload}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Export course data to spreadsheets
                            </a>
                        )}
                        <br />
                        {canRefreshParticipants &&
                            course != null &&
                            course.externalId != null && (
                                <Link
                                    to={this.props.location.pathname}
                                    onClick={() => {
                                        this.props.refreshParticipants(
                                            course.id,
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faDownload}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    Retrieve participant data
                                </Link>
                            )}
                        <br />
                    </div>
                </Col>
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            course: (id: number) => getCourse(state, id),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            fetchCourse: courseRequestedAction,
            refreshParticipants: canvasRefreshParticipantsRequestedAction,
        },
    )(CourseAdministration),
);
