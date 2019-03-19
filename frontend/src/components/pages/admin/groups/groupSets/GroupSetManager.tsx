import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Col, Button } from "reactstrap";

import { getGroupSets } from "../../../../../state/groups/selectors";
import { groupSetsFetchRequestedAction } from "../../../../../state/groups/actions";

import { GroupSetDtoSummary, CourseDtoSummary } from "../../../../../api/types";
import { ApplicationState } from "../../../../../state/state";
import CanvasCard from "../../../../CanvasCard";
import { faUsers, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    canvasRefreshSetsListRequestedAction,
    CanvasRefreshSetsListRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { courseRequestedAction } from "../../../../../state/courses/action";
import { getCourse } from "../../../../../state/courses/selectors";
import { buildContent } from "../../../../pagebuilder";

interface GroupSetManagerProps {
    groupSets: GroupSetDtoSummary[] | null;

    course: (id: number) => CourseDtoSummary | null;

    fetchGroupSets: (courseId: number) => {
        type: string,
    };

    fetchCourse: (id: number) => {
        type: string,
    };

    refreshSetsList: (courseId: number) => CanvasRefreshSetsListRequestedAction;
}

class GroupSetManager extends Component<GroupSetManagerProps & RouteComponentProps<any>> {

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
        const { groupSets } = this.props;

        const course = this.props.course(Number(this.props.match.params.cid));

        if (course == null) {
            return null;
        } else {
            return (
                <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                    {course.externalId != null &&
                        <Col xs="12" md="12">
                            <Row>
                                <Col xs="12" lg="4">
                                    <Button block color="primary" size="lg" className="mb-3"
                                        onClick={() => this.props.refreshSetsList(this.props.match.params.cid)}>
                                        <FontAwesomeIcon icon={faSync} className="mr-2" />
                                        Sync group sets with Canvas
                                        </Button>
                                </Col>
                            </Row>
                        </Col>
                    }
                    {groupSets != null &&
                        groupSets.map((gSet) =>
                            <CanvasCard
                                watermarkIcon={faUsers}
                                key={gSet.id}
                                cardTitle={gSet.name}
                                url={`/courses/${gSet.course.id}/administration/groupsets/${gSet.id}`}
                            />,
                        )
                    }
                </Row>
            );
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    course: (id: number) => getCourse(state, id),
    groupSets: getGroupSets(state),
}), {
        fetchGroupSets: groupSetsFetchRequestedAction,
        refreshSetsList: canvasRefreshSetsListRequestedAction,
        fetchCourse: (id: number) => courseRequestedAction(id),
    })(GroupSetManager));
