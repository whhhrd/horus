import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Col, Button } from "reactstrap";

import { getGroupSets } from "../../../../../state/groups/selectors";
import { groupSetsFetchRequestedAction } from "../../../../../state/groups/actions";

import { GroupSetDtoSummary, CourseDtoSummary } from "../../../../../api/types";
import { ApplicationState } from "../../../../../state/state";
import CanvasCard from "../../../../CanvasCard";
import {
    faUsers,
    faInfoCircle,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    canvasRefreshSetsListRequestedAction,
    CanvasRefreshSetsListRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { courseRequestedAction } from "../../../../../state/courses/action";
import { getCourse } from "../../../../../state/courses/selectors";
import { buildContent } from "../../../../pagebuilder";
import CoursePermissions from "../../../../../api/permissions";
import { getCoursePermissions } from "../../../../../state/auth/selectors";
import {
    canvasGroupSetsSyncPerform,
    groupsAnyView,
    groupsAnyList,
} from "../../../../../state/auth/constants";

interface GroupSetManagerProps {
    groupSets: GroupSetDtoSummary[] | null;

    course: (id: number) => CourseDtoSummary | null;

    fetchGroupSets: (
        courseId: number,
    ) => {
        type: string;
    };

    fetchCourse: (
        id: number,
    ) => {
        type: string;
    };

    refreshSetsList: (courseId: number) => CanvasRefreshSetsListRequestedAction;
    coursePermissions: CoursePermissions | null;
}

class GroupSetManager extends Component<
    GroupSetManagerProps & RouteComponentProps<any>
> {
    componentDidMount() {
        // Fetch the GroupSets
        this.props.fetchGroupSets(this.props.match.params.cid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        return buildContent("Group Sets Manager", this.buildContent());
    }

    buildContent() {
        const permissions = this.props.coursePermissions!;
        const cid = Number(this.props.match.params.cid);
        const canPerformCanvasSync = canvasGroupSetsSyncPerform.check(
            cid,
            permissions,
        );
        const canListGroups = groupsAnyList.check(cid, permissions);
        const canViewGroups = groupsAnyView.check(cid, permissions);

        const { groupSets } = this.props;
        const course = this.props.course(cid);

        if (course == null) {
            return null;
        } else {
            return (
                <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                    {canPerformCanvasSync && course.externalId != null && (
                        <Col xs="12" md="12">
                            <Row>
                                <Col xs="12" lg="4">
                                    <Button
                                        block
                                        color="primary"
                                        size="lg"
                                        className="mb-3"
                                        onClick={() =>
                                            this.props.refreshSetsList(
                                                this.props.match.params.cid,
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faDownload}
                                            className="mr-2"
                                        />
                                        Retrieve Canvas group sets{" "}
                                        <abbr
                                            title="This does not change the Canvas course settings in
                                            any way. Use this when group sets in canvas are deleted or added."
                                            className="float-right"
                                        >
                                            <FontAwesomeIcon
                                                icon={faInfoCircle}
                                                className="ml-2"
                                            />
                                        </abbr>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    )}
                    {groupSets != null &&
                        groupSets.map((gSet) => (
                            <CanvasCard
                                watermarkIcon={faUsers}
                                key={gSet.id}
                                cardTitle={gSet.name}
                                url={`/courses/${
                                    gSet.course.id
                                }/administration/groupsets/${gSet.id}`}
                                clickable={canListGroups && canViewGroups}
                            />
                        ))}
                </Row>
            );
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            course: (id: number) => getCourse(state, id),
            groupSets: getGroupSets(state),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            fetchGroupSets: groupSetsFetchRequestedAction,
            refreshSetsList: canvasRefreshSetsListRequestedAction,
            fetchCourse: (id: number) => courseRequestedAction(id),
        },
    )(GroupSetManager),
);
