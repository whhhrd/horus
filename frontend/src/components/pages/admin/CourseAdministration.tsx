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
} from "../../../state/auth/constants";

interface CourseAdministrationProps {
    coursePermissions: CoursePermissions | null;
}

class CourseAdministration extends PureComponent<
    CourseAdministrationProps & RouteComponentProps<any>
> {
    render() {
        return buildContent("Course Administration", this.buildContent(), null);
    }

    buildContent() {
        const cid = this.props.match.params.cid;
        const permissions = this.props.coursePermissions!;

        const canListAssignmentSets = assignmentSetsAnyList.check(
            cid,
            permissions,
        );
        const canListGroupSets = groupSetsAnyList.check(cid, permissions);
        const canExport = canExportData.check(cid, permissions);

        const canViewListLabelManager = canViewListLabels.check(
            cid,
            permissions,
        );
        const accessToken = getCurrentAccessToken();

        return (
            <Row>
                <Col>
                    {canListAssignmentSets && (
                        <Link
                            to={`/courses/${cid}/administration/assignmentsets`}
                        >
                            <h5>Manage Assignment Sets</h5>
                        </Link>
                    )}
                    {canListGroupSets && (
                        <Link to={`/courses/${cid}/administration/groupsets`}>
                            <h5>Manage Group Sets</h5>
                        </Link>
                    )}
                    {canViewListLabelManager && (
                        <Link
                            to={`/courses/${
                                this.props.match.params.cid
                            }/administration/labels`}
                        >
                            <h5>Manage Course Labels</h5>
                        </Link>
                    )}
                    {true && (
                        <Link
                            to={`/courses/${
                                this.props.match.params.cid
                            }/administration/roles`}
                        >
                            <h5>Manage Supplementary Roles</h5>
                        </Link>
                    )}
                    {canExport && accessToken != null && (
                        <a
                            href={`/api/courses/${
                                this.props.match.params.cid
                            }/export?token=${accessToken}`}
                            target="_blank"
                        >
                            <h5>Export Data to Spreadsheet</h5>
                        </a>
                    )}
                </Col>
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            coursePermissions: getCoursePermissions(state),
        }),
        {},
    )(CourseAdministration),
);
