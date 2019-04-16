import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Col, Button } from "reactstrap";

import { getGroupSets } from "../../../../../state/groups/selectors";
import {
    groupSetsFetchRequestedAction,
    GroupSetsFetchAction,
} from "../../../../../state/groups/actions";

import { GroupSetDtoSummary, CourseDtoSummary } from "../../../../../api/types";
import { ApplicationState } from "../../../../../state/state";
import CanvasCard from "../../../../CanvasCard";
import {
    faUsers,
    faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    canvasRefreshSetsListRequestedAction,
    CanvasRefreshSetsListRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import {
    courseRequestedAction,
    CourseRequestedAction,
} from "../../../../../state/courses/action";
import { getCourse } from "../../../../../state/courses/selectors";
import { buildContent } from "../../../../pagebuilder";
import CoursePermissions from "../../../../../api/permissions";
import { getCoursePermissions } from "../../../../../state/auth/selectors";
import {
    canvasGroupSetsSyncPerform,
    groupsAnyView,
    groupsAnyList,
    groupSetsAnyList,
} from "../../../../../state/auth/constants";
import GroupSetImportModal from "./GroupSetImportModal";

interface GroupSetManagerProps {
    groupSets: GroupSetDtoSummary[] | null;
    coursePermissions: CoursePermissions | null;
    course: (id: number) => CourseDtoSummary | null;

    fetchGroupSets: (courseId: number) => GroupSetsFetchAction;
    fetchCourse: (id: number) => CourseRequestedAction;
    refreshSetsList: (courseId: number) => CanvasRefreshSetsListRequestedAction;
}

interface GroupSetManagerState {
    showGroupSetImportModal: boolean;
}

/**
 * A page that shows the group sets within the course to
 * permitted users. Clicking on a group set will redirect
 * the user to the groups manager of the corresponding groupset
 */
class GroupSetManager extends Component<
    GroupSetManagerProps & RouteComponentProps<any>,
    GroupSetManagerState
> {
    constructor(props: GroupSetManagerProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            showGroupSetImportModal: false,
        };
        this.toggleGroupSetImportModal = this.toggleGroupSetImportModal.bind(
            this,
        );
    }

    toggleGroupSetImportModal() {
        this.setState((state) => ({
            showGroupSetImportModal: !state.showGroupSetImportModal,
        }));
    }

    componentDidMount() {
        const cid = Number(this.props.match.params.cid);

        // Fetch the GroupSets
        this.props.fetchGroupSets(this.props.match.params.cid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(cid);
    }

    render() {
        return buildContent("Group Sets Manager", this.buildContent());
    }

    buildContent() {
        const cid = Number(this.props.match.params.cid);
        const { groupSets } = this.props;
        const course = this.props.course(cid);

        // Get user permissions
        const permissions = this.props.coursePermissions!;
        const canListGroupSets = groupSetsAnyList.check(cid, permissions);
        const canListGroups = groupsAnyList.check(cid, permissions);
        const canViewGroups = groupsAnyView.check(cid, permissions);
        const canPerformCanvasSync = canvasGroupSetsSyncPerform.check(
            cid,
            permissions,
        );

        // If the user is not permitted to view the page, display 404
        if (!canListGroupSets) {
            return undefined;
        } else if (course == null) {
            return null;
        } else {
            return (
                <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                    {canPerformCanvasSync && course.externalId != null && (
                        <Col xs="12" md="12">
                            <Button
                                color="primary"
                                size="lg"
                                className="mb-3"
                                onClick={this.toggleGroupSetImportModal}
                            >
                                <FontAwesomeIcon
                                    icon={faUpload}
                                    className="mr-2"
                                />
                                Import group set to Canvas{" "}
                            </Button>
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
                    {this.state.showGroupSetImportModal && (
                        <GroupSetImportModal
                            isOpen={this.state.showGroupSetImportModal}
                            onCloseModal={this.toggleGroupSetImportModal}
                        />
                    )}
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
