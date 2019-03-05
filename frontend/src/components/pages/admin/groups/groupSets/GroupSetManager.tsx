import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Container, Row, Spinner, Col, Button } from "reactstrap";

import { getGroupSets } from "../../../../../state/groups/selectors";
import { groupSetsFetchRequestedAction } from "../../../../../state/groups/actions";

import { GroupSetDtoSummary, CourseDtoSummary } from "../../../../../state/types";
import { ApplicationState } from "../../../../../state/state";
import CanvasCard from "../../../../CanvasCard";
import { faUsers, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    canvasRefreshSetsListRequestedAction,
    CanvasRefreshSetsListRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { courseRequestedAction } from "../../../../../state/course-selection/action";
import { getCourse } from "../../../../../state/course-selection/selectors";

interface GroupSetManagerProps {
    course: (id: number) => CourseDtoSummary | undefined;
    groupSets: GroupSetDtoSummary[] | null;

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
        const { groupSets } = this.props;
        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Group Sets Manager
                        {groupSets == null &&
                                <Spinner color="primary" type="grow"></Spinner>
                            }
                        </h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2 flex-row">
                    <Col md="12" xs="12">
                        {
                            this.props.course(this.props.match.params.cid) !== undefined ?
                                <Button block color="primary" size="lg" className="mb-3 w-25"
                                    onClick={() =>
                                        this.props.refreshSetsList(this.props.match.params.cid)}>
                                    <FontAwesomeIcon icon={faSync} className="mr-2" />Sync group sets with Canvas
                            </Button> : null
                        }
                    </Col>
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
            </Container>
        );
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
