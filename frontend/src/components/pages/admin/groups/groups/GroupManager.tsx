import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner, Container, Row, Col, Button, Input } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router";
import { GroupDtoFull, CourseDtoSummary } from "../../../../../state/types";
import { ApplicationState } from "../../../../../state/state";
import { getGroups } from "../../../../../state/groups/selectors";
import { groupsFetchRequestedAction, GroupsFetchAction } from "../../../../../state/groups/actions";
import GroupListItem from "./GroupListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import {
    canvasRefreshSetRequestedAction,
    CanvasRefreshSetRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { getCourse } from "../../../../../state/course-selection/selectors";
import { courseRequestedAction } from "../../../../../state/course-selection/action";

interface GroupManagerProps {
    groups: GroupDtoFull[] | null;
    fetchGroups: (groupSetId: number) => GroupsFetchAction;

    course: (id: number) => CourseDtoSummary | undefined;
    fetchCourse: (id: number) => {
        type: string,
    };

    refreshSet: (courseId: number, groupSetId: number) => CanvasRefreshSetRequestedAction;
}

class GroupManager extends Component<GroupManagerProps & RouteComponentProps<any>> {

    componentDidMount() {
        this.props.fetchGroups(this.props.match.params.gsid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        const { groups } = this.props;

        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Group Sets Manager
                        {groups == null &&
                                <Spinner color="primary" type="grow"></Spinner>
                            }
                        </h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2 flex-row justify-content-center">
                    <Col className="col-md-6 col-xs-12">
                        {
                            this.props.course(this.props.match.params.cid) !== undefined ?
                                <div>
                                    <Button
                                        block color="primary"
                                        size="lg"
                                        className="mb-3"
                                        onClick={() =>
                                            this.props.refreshSet(this.props.match.params.cid,
                                                this.props.match.params.gsid)}>
                                        <FontAwesomeIcon
                                            icon={faSync}
                                            className="mr-2" />Sync this group set with Canvas
                                    </Button>
                                    <hr />
                                </div> : null
                        }
                        <Input
                            className="form-control-lg mb-3"
                            placeholder="Group name/number or student name/number" />
                        <Row>
                            {groups != null &&
                                groups.map((group) =>
                                    <GroupListItem key={group.id} group={group} />,
                                )
                            }
                        </Row>

                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    course: (id: number) => getCourse(state, id),
    groups: getGroups(state),
}), {
        fetchGroups: groupsFetchRequestedAction,
        refreshSet: canvasRefreshSetRequestedAction,
        fetchCourse: (id: number) => courseRequestedAction(id),
    })(GroupManager));
