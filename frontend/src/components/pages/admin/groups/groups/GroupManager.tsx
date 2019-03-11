import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Input, Table } from "reactstrap";
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
import { courseRequestedAction } from "../../../../../state/course-selection/action";
import { getCourse } from "../../../../../state/course-selection/selectors";
import { buildContent, centerSpinner } from "../../../../pagebuilder";
import CommentThread, { CommentThreadType } from "../../../../comments/CommentThread";
import { openSidebarPhoneAction } from "../../../../../state/sidebar/actions";
import { Action } from "redux";

interface GroupManagerProps {
    groups: GroupDtoFull[] | null;

    course: (id: number) => CourseDtoSummary | null;

    fetchCourse: (id: number) => Action;

    openSidebarPhone: () => Action;

    fetchGroups: (groupSetId: number) => GroupsFetchAction;

    refreshSet: (courseId: number, groupSetId: number) => CanvasRefreshSetRequestedAction;
}

interface GroupManagerState {
    searchQuery: string;
    currentlyShownGroup: GroupDtoFull | null;
}

class GroupManager extends Component<GroupManagerProps & RouteComponentProps<any>, GroupManagerState> {

    constructor(props: GroupManagerProps & RouteComponentProps<any>) {
        super(props);

        this.state = {
            searchQuery: "",
            currentlyShownGroup: null,
        };
        this.onShowClick = this.onShowClick.bind(this);
    }

    componentDidMount() {
        this.props.fetchGroups(this.props.match.params.gsid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        return buildContent("Group Sets Manager", this.buildContent(), this.buildSidebar());
    }

    onShowClick(group: GroupDtoFull) {
        this.setState((_) => ({ currentlyShownGroup: group }));
        this.props.openSidebarPhone();
    }

    buildContent() {
        const { groups } = this.props;

        const course = this.props.course(this.props.match.params.cid);

        if (course === null) {
            return null;
        } else {
            return (
                <Row className="flex-row justify-content-center">
                    <Col xs="12" md="8">
                        {course.externalId != null &&
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
                            </div>
                        }
                        <Input
                            className="form-control-lg mb-3"
                            placeholder="Group name/number or student name/number"
                            onInput={(e) => {
                                // @ts-ignore
                                this.onSearchQueryInput(e.target.value);
                            }} />
                        <Row>
                            {this.renderGroups(groups)}
                        </Row>
                    </Col>
                </Row>
            );
        }
    }

    buildSidebar() {
        const { currentlyShownGroup } = this.state;

        if (currentlyShownGroup === null) {
            return null;
        } else {
            const participants = currentlyShownGroup.participants;
            return (
                <div>
                    <h3>{currentlyShownGroup.name}</h3>
                    {
                        participants.length > 0 && <Table className="mt-3 w-100 table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Student number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    participants.map((p) =>
                                        <tr key={p.id}>
                                            <td>{p.person.fullName}</td>
                                            <td>{p.person.loginId}</td>
                                        </tr>)
                                }
                            </tbody>
                        </Table>
                    }
                    {
                        participants.length === 0 &&
                        <span className="text-muted">This group is empty.</span>
                    }
                    <hr />
                    <h3>Comments</h3>
                    <CommentThread linkedEntityId={currentlyShownGroup.id}
                        linkedEntityType={CommentThreadType.Group}
                        commentThreadBrief={currentlyShownGroup.commentThread}
                        commentThreadSubject={currentlyShownGroup.name}
                        showCommentThreadContent={false}
                        needToFetchThread={true} />

                    {
                        participants.length > 0 &&
                        participants.map((p) =>
                            <CommentThread key={p.id} linkedEntityId={p.id}
                                linkedEntityType={CommentThreadType.Participant}
                                commentThreadBrief={p.commentThread}
                                commentThreadSubject={p.person.fullName}
                                showCommentThreadContent={false}
                                needToFetchThread={true} />)
                    }
                </div>
            );
        }
    }

    private onSearchQueryInput(newValue: string) {
        this.setState(() => ({ searchQuery: newValue.toLowerCase() }));
    }

    private renderGroups(groups: GroupDtoFull[] | null) {
        const searchQuery = this.state.searchQuery;
        const groupsRender = [];

        if (groups == null) {
            return (
                <Col lg="12" xs="12">
                    {centerSpinner()}
                </Col>
            );
        } else {
            for (const group of groups) {
                if (group.name.toLowerCase().includes(searchQuery)) {
                    groupsRender.push(<GroupListItem key={group.id} group={group} onShowClick={this.onShowClick} />);
                } else {
                    for (const participant of group.participants) {
                        if (participant.person.fullName.toLowerCase().includes(searchQuery)
                            || participant.person.loginId.toLowerCase().includes(searchQuery)) {
                            groupsRender.push(<GroupListItem
                                key={group.id}
                                group={group}
                                onShowClick={this.onShowClick} />);
                            break;
                        }
                    }
                }
            }
            return groupsRender;
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    course: (id: number) => getCourse(state, id),
    groups: getGroups(state),
}), {
        fetchGroups: groupsFetchRequestedAction,
        refreshSet: canvasRefreshSetRequestedAction,
        openSidebarPhone: openSidebarPhoneAction,
        fetchCourse: (id: number) => courseRequestedAction(id),
    })(GroupManager));
