import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Input, Table } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router";
import queryString from "query-string";
import { GroupDtoFull, CourseDtoSummary } from "../../../../../api/types";
import { ApplicationState } from "../../../../../state/state";
import { getGroups } from "../../../../../state/groups/selectors";
import {
    groupsFetchRequestedAction,
    GroupsFetchAction,
} from "../../../../../state/groups/actions";
import GroupListItem from "./GroupListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faDownload } from "@fortawesome/free-solid-svg-icons";
import {
    canvasRefreshSetRequestedAction,
    CanvasRefreshSetRequestedAction,
} from "../../../../../state/canvas-settings/actions";
import { courseRequestedAction } from "../../../../../state/courses/action";
import { getCourse } from "../../../../../state/courses/selectors";
import { buildContent, centerSpinner, setPageTitle } from "../../../../pagebuilder";
import CommentThread from "../../../../comments/CommentThread";
import { Action } from "redux";
import { EntityType } from "../../../../../state/comments/types";
import CoursePermissions from "../../../../../api/permissions";
import { getCoursePermissions } from "../../../../../state/auth/selectors";
import {
    canvasGroupsSyncPerform,
    groupsAnyView,
    viewCommentSidebar,
} from "../../../../../state/auth/constants";

interface GroupManagerProps {
    groups: GroupDtoFull[] | null;

    course: (id: number) => CourseDtoSummary | null;

    fetchCourse: (id: number) => Action;

    fetchGroups: (groupSetId: number) => GroupsFetchAction;

    refreshSet: (
        courseId: number,
        groupSetId: number,
    ) => CanvasRefreshSetRequestedAction;

    coursePermissions: CoursePermissions | null;
}

interface GroupManagerState {
    searchQuery: string;
}

class GroupManager extends Component<
    GroupManagerProps & RouteComponentProps<any>,
    GroupManagerState
> {
    static PAGE_TITLE = "Groups Manager";

    constructor(props: GroupManagerProps & RouteComponentProps<any>) {
        super(props);

        this.state = {
            searchQuery: "",
        };
        this.onShowClick = this.onShowClick.bind(this);
    }

    componentDidMount() {
        this.props.fetchGroups(this.props.match.params.gsid);

        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);

        setPageTitle(GroupManager.PAGE_TITLE);
    }

    render() {
        return buildContent(
            GroupManager.PAGE_TITLE,
            this.buildContent(),
            this.buildSidebar(),
        );
    }

    onShowClick(gid: number) {
        const { history } = this.props;
        history.push({
            ...history.location,
            search: `?gid=${gid}`,
            hash: "sidebar",
        });
    }

    buildContent() {
        const permissions = this.props.coursePermissions!;
        const cid = Number(this.props.match.params.cid);
        const canPerformCanvasSync = canvasGroupsSyncPerform.check(
            cid,
            permissions,
        );
        const canViewGroups = groupsAnyView.check(cid, permissions);

        const { groups } = this.props;

        const course = this.props.course(this.props.match.params.cid);

        if (course == null || !canViewGroups || groups == null) {
            return null;
        } else {
            return (
                <Row className="flex-row justify-content-center">
                    <Col xs="12" md="12" lg="12" xl="12">
                        {canPerformCanvasSync && course.externalId != null && (
                            <div>
                                <Button
                                    block
                                    color="primary"
                                    size="lg"
                                    className="mb-3"
                                    onClick={() =>
                                        this.props.refreshSet(
                                            this.props.match.params.cid,
                                            this.props.match.params.gsid,
                                        )
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faDownload}
                                        className="mr-2"
                                    />
                                    Retrieve groups from Canvas
                                    <abbr
                                        title="This does not change the Canvas groups compositions in
                                            any way. Use this when group compositions change in Canvas, so that
                                            Horus groups are in sync with the groups within this group set."
                                            className="float-right"
                                    >
                                        <FontAwesomeIcon
                                            icon={faInfoCircle}
                                            className="ml-2"
                                            size="lg"
                                        />
                                    </abbr>
                                </Button>
                                <hr />
                            </div>
                        )}
                        <Input
                            className="form-control-lg mb-3"
                            placeholder="Group name/number or student name/number"
                            onInput={(e) => {
                                // @ts-ignore
                                this.onSearchQueryInput(e.target.value);
                            }}
                        />
                        <Row>
                            {this.renderGroups(
                                groups.sort((groupA, groupB) => {
                                    return groupA.name.localeCompare(
                                        groupB.name,
                                        "en",
                                        { numeric: true },
                                    );
                                }),
                            )}
                        </Row>
                    </Col>
                </Row>
            );
        }
    }

    buildSidebar() {
        const permissions = this.props.coursePermissions!;
        const cid = Number(this.props.match.params.cid);
        const canViewComments = viewCommentSidebar.check(cid, permissions);
        const gid = Number(queryString.parse(this.props.location.search).gid);

        let currentlyShownGroup = null;

        if (gid != null && this.props.groups != null) {
            currentlyShownGroup = this.props.groups.find((g) => g.id === gid);
        }

        if (currentlyShownGroup == null) {
            return (
                <div className="d-flex w-100 h-100 align-items-center">
                    <h4 className="d-block w-100 text-center">
                        Nothing to show here.
                    </h4>
                </div>
            );
        } else {
            const participants = currentlyShownGroup.participants;
            return (
                <div>
                    <h3>{currentlyShownGroup.name}</h3>
                    {participants.length > 0 && (
                        <Table className="mt-3 w-100 table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Student number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.person.fullName}</td>
                                        <td>{p.person.loginId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    {participants.length === 0 && (
                        <span className="text-muted">This group is empty.</span>
                    )}
                    {canViewComments && (
                        <div>
                            <hr />
                            <h3>Comments</h3>
                            <CommentThread
                                entityId={currentlyShownGroup.id}
                                commentThreadId={
                                    currentlyShownGroup.commentThread != null
                                        ? currentlyShownGroup.commentThread.id
                                        : null
                                }
                                entityType={EntityType.Group}
                                commentThreadSubject={currentlyShownGroup.name}
                                commentThreadOpen={false}
                            />

                            {participants.length > 0 &&
                                participants.map((p) => (
                                    <CommentThread
                                        key={p.id}
                                        entityId={p.id}
                                        commentThreadId={
                                            p.commentThread != null
                                                ? p.commentThread.id
                                                : null
                                        }
                                        entityType={
                                            EntityType.Participant
                                        }
                                        commentThreadSubject={p.person.fullName}
                                        commentThreadOpen={false}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            );
        }
    }

    private onSearchQueryInput(newValue: string) {
        this.setState(() => ({ searchQuery: newValue.toLowerCase() }));
    }

    private renderGroups(groups: GroupDtoFull[] | null) {
        const permissions = this.props.coursePermissions!;
        const cid = Number(this.props.match.params.cid);
        const canViewGroups = groupsAnyView.check(cid, permissions);

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
                    groupsRender.push(
                        <GroupListItem
                            key={group.id}
                            group={group}
                            onShowClick={this.onShowClick}
                            showButton={canViewGroups}
                        />,
                    );
                } else {
                    for (const participant of group.participants) {
                        if (
                            participant.person.fullName
                                .toLowerCase()
                                .includes(searchQuery) ||
                            participant.person.loginId
                                .toLowerCase()
                                .includes(searchQuery)
                        ) {
                            groupsRender.push(
                                <GroupListItem
                                    key={group.id}
                                    group={group}
                                    onShowClick={this.onShowClick}
                                    showButton={canViewGroups}
                                />,
                            );
                            break;
                        }
                    }
                }
            }
            return groupsRender;
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            course: (id: number) => getCourse(state, id),
            groups: getGroups(state),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            fetchGroups: groupsFetchRequestedAction,
            refreshSet: canvasRefreshSetRequestedAction,
            fetchCourse: (id: number) => courseRequestedAction(id),
        },
    )(GroupManager),
);
