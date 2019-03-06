import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner, Container, Row, Col, Button, Input } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router";
import { GroupDtoFull, CourseDtoFull } from "../../../../../state/types";
import { ApplicationState } from "../../../../../state/state";
import { getGroups } from "../../../../../state/groups/selectors";
import { groupsFetchRequestedAction, GroupsFetchAction } from "../../../../../state/groups/actions";
import GroupListItem from "./GroupListItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";
import {
    canvasRefreshSetRequestedAction,
    CanvasRefreshSetRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { getCourseDtoFull } from "../../../../../state/course-selection/selectors";
import { courseRequestedAction } from "../../../../../state/course-selection/action";

interface GroupManagerProps {
    groups: GroupDtoFull[] | null;
    fetchGroups: (groupSetId: number) => GroupsFetchAction;

    course: CourseDtoFull | undefined;
    fetchCourse: (id: number) => {
        type: string,
    };

    refreshSet: (courseId: number, groupSetId: number) => CanvasRefreshSetRequestedAction;
}

interface GroupManagerState {
    searchQuery: string;
}

class GroupManager extends Component<GroupManagerProps & RouteComponentProps<any>, GroupManagerState> {

    constructor(props: GroupManagerProps & RouteComponentProps<any>) {
        super(props);

        this.state = {
            searchQuery: "",
        };
    }

    componentDidMount() {
        this.props.fetchGroups(this.props.match.params.gsid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        const { groups, course } = this.props;

        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Group Sets Manager
                            {groups == null &&
                            <Spinner color="primary" type="grow"/>
                            }
                        </h3>
                        <hr/>
                    </Col>
                </Row>
                <Row className="main-body-display px-2 flex-row justify-content-center">
                    <Col className="col-md-6 col-xs-12">
                        {
                            course !== undefined && course!.externalId !== null ?
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
                                            className="mr-2"/>Sync this group set with Canvas
                                    </Button>
                                    <hr/>
                                </div> : null
                        }
                        <Input
                            className="form-control-lg mb-3"
                            placeholder="Group name/number or student name/number"
                            onInput={(e) => {
                                // @ts-ignore
                                this.onSearchQueryInput(e.target.value);
                            }}/>
                        <Row>{this.renderGroups(groups)}</Row>
                    </Col>
                </Row>
            </Container>
        );
    }

    private onSearchQueryInput(newValue: string) {
        this.setState(() => ({searchQuery: newValue.toLowerCase()}));
    }

    private renderGroups(groups: GroupDtoFull[] | null) {
        if (groups === null) {
            return null;
        } else {
            const searchQuery = this.state.searchQuery;
            const groupsRender = [];
            for (const group of groups) {
                if (group.name.toLowerCase().includes(searchQuery)) {
                    groupsRender.push(<GroupListItem key={group.id} group={group}/>);
                } else {
                    for (const participant of group.participants) {
                        if (participant.person.fullName.toLowerCase().includes(searchQuery)
                            || participant.person.loginId.toLowerCase().includes(searchQuery)) {
                            groupsRender.push(<GroupListItem key={group.id} group={group}/>);
                            break;
                        }
                    }
                }
            }
            return (
                <Row>
                    {groupsRender}
                </Row>
            );
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    course: getCourseDtoFull(state),
    groups: getGroups(state),
}), {
    fetchGroups: groupsFetchRequestedAction,
    refreshSet: canvasRefreshSetRequestedAction,
    fetchCourse: (id: number) => courseRequestedAction(id),
})(GroupManager));
