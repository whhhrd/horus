import React, { Component } from "react";

import { CommentThreadDtoFull, CommentDto } from "../../api/types";

import Comment from "../comments/Comment";
import { connect } from "react-redux";
import { getCommentThread } from "../../state/comments/selectors";
import { ApplicationState } from "../../state/state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    IconDefinition,
    faUser,
    faPencilRuler,
    faUsers,
    faTasks,
    faPlus,
    faInfo,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import {
    Button,
    Collapse,
    Alert,
    ListGroup,
    Card,
    CardTitle,
    Badge,
} from "reactstrap";

import CommentCreatorModal from "./CommentCreatorModal";

import {
    CommentThreadRequestedAction,
    commentThreadRequestedAction,
} from "../../state/comments/action";

import CardBody from "reactstrap/lib/CardBody";
import CommentThreadCreatorModal from "./CommentThreadCreatorModal";
import { EntityType } from "../../state/comments/types";
import CoursePermissions from "../../api/permissions";
import {getCoursePermissions} from "../../state/auth/selectors";
import {RouteComponentProps, withRouter} from "react-router";
import {commentAnyCreate, commentAnyDelete, commentAnyEdit, viewCommentSidebar} from "../../state/auth/constants";

interface CommentThreadProps {
    linkedEntityId: number;
    commentThreadId: number | null;
    linkedEntityType: EntityType;
    commentThreadSubject: string;
    showCommentThreadContent: boolean;
    coursePermissions: CoursePermissions | null;
    immutableThread?: boolean;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;

    fetchCommentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadRequestedAction;
}

interface CommentThreadState {
    commentCreatorModalOpen: boolean;
    commentThreadCreatorModalOpen: boolean;
    showCommentThreadContent: boolean;
}

/**
 * Usage:
 *
 * In order to use a CommentThread, you have to specify certain props, namely:
 * 1. linkedEntityId: this is the ID of the participant, group, assignment or signoff result
 * 2. linkedEntityType: this is the type of the entity. Use EntityType to specify it to your needs
 * 3. commentThreadId: this is the commentThreadId that is part of the entity's CommentThreadDtoBrief (except for
 *        SignOffResultDtoCompact, use the actual commentThreadId there). See example usage below.
 * 4. commendThreadSubject: What is this comment thread about? This will be the highlighted part of the comment thread
 *        title.
 * 5. showCommentThreadContent: do you want the collapse to be open or closed (when the component mounts)?
 *        'true' for open, 'false' for closed
 *
 * <CommentThread
 *      linkedEntityId={participant.id}
 *      commentThreadId={
 *          participant.commentThread != null
 *              ? participant.commentThread.id
 *                   : null
 *      }
 *      linkedEntityType={EntityType.Participant}
 *      commentThreadSubject={participant.person.fullName}
 *      showCommentThreadContent={false}
 * />
 */
class CommentThread extends Component<CommentThreadProps & RouteComponentProps<any>, CommentThreadState> {
    constructor(props: CommentThreadProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            commentCreatorModalOpen: false,
            commentThreadCreatorModalOpen: false,
            showCommentThreadContent: props.showCommentThreadContent,
        };
        this.toggleCreateCommentThreadModal = this.toggleCreateCommentThreadModal.bind(
            this,
        );
        this.toggleCreateCommentModal = this.toggleCreateCommentModal.bind(
            this,
        );
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        const {
            linkedEntityId,
            linkedEntityType,
            commentThreadId,
        } = this.props;

        if (commentThreadId != null) {
            this.props.fetchCommentThread(linkedEntityId, linkedEntityType);
        }
    }

    componentDidUpdate(prevProps: CommentThreadProps) {
        const {
            linkedEntityId,
            linkedEntityType,
            commentThreadId,
        } = this.props;

        if (
            commentThreadId != null &&
            prevProps.linkedEntityId !== linkedEntityId
        ) {
            this.props.fetchCommentThread(linkedEntityId, linkedEntityType);
        }
    }

    toggleCreateCommentModal() {
        this.setState((state) => ({
            commentCreatorModalOpen: !state.commentCreatorModalOpen,
        }));
    }

    toggleCreateCommentThreadModal() {
        this.setState((state) => ({
            commentThreadCreatorModalOpen: !state.commentThreadCreatorModalOpen,
        }));
    }

    toggleCollapse() {
        this.setState((state) => ({
            showCommentThreadContent: !state.showCommentThreadContent,
        }));
    }

    render() {
        if (this.props.immutableThread && this.props.commentThreadId == null) {
            return null;
        }

        const cid = this.props.match.params.cid;
        const permissions = this.props.coursePermissions!;
        const canView = viewCommentSidebar.check(cid, permissions);
        if (!canView) {
            return null;
        }
        const canCreate = commentAnyCreate.check(cid, permissions);
        const canEdit = commentAnyEdit.check(cid, permissions);
        const canDelete = commentAnyDelete.check(cid, permissions);

        let borderColor: string;
        let titleEntityPrefix: string;
        switch (this.props.linkedEntityType) {
            case EntityType.Assignment:
                borderColor = `thread-border-assignment`;
                titleEntityPrefix = "Assignment: ";
                break;
            case EntityType.Participant:
                borderColor = `thread-border-participant`;
                titleEntityPrefix = "Student: ";
                break;
            case EntityType.Signoff:
                borderColor = `thread-border-signoff`;
                titleEntityPrefix = "";
                break;
            case EntityType.Group:
                borderColor = `thread-border-group`;
                titleEntityPrefix = "Group: ";
                break;
        }

        return (
            <div>
                <Card className={`m-0 my-3 mw-100 ${borderColor!}`}>
                    <CardBody>
                        <div
                            className="d-flex justify-content-between
                                align-items-center flex-row flex-nowrap cursor-pointer"
                            onClick={this.toggleCollapse}
                        >
                            <CardTitle className="my-auto d-flex mr-2">
                                {this.buildCommentThreadTitle(
                                    titleEntityPrefix!,
                                )}
                            </CardTitle>

                            <div
                                className={`chevron ${
                                    this.state.showCommentThreadContent
                                        ? "chevron-open"
                                        : ""
                                }`}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                        </div>
                        <Collapse isOpen={this.state.showCommentThreadContent}>
                            {this.buildCommentThreadContent(canCreate, canEdit, canDelete)}
                        </Collapse>
                    </CardBody>
                </Card>
            </div>
        );
    }

    buildCommentThreadTitle(titlePrefix: string) {
        let iconElement: IconDefinition | undefined;
        switch (this.props.linkedEntityType) {
            case EntityType.Participant:
                iconElement = faUser;
                break;
            case EntityType.Group:
                iconElement = faUsers;
                break;
            case EntityType.Assignment:
                iconElement = faPencilRuler;
                break;
            case EntityType.Signoff:
                iconElement = faTasks;
                break;
        }

        const numberOfComments =
            this.props.commentThread(
                this.props.linkedEntityId,
                this.props.linkedEntityType,
            ) != null
                ? this.props.commentThread(
                      this.props.linkedEntityId,
                      this.props.linkedEntityType,
                  )!.comments.length
                : 0;

        return (
            <mark className="px-2">
                <abbr
                    title={`Comments about ${titlePrefix}${
                        this.props.commentThreadSubject
                    }`}
                >
                    <FontAwesomeIcon className="mr-2" icon={iconElement!} />
                    {this.props.commentThreadSubject}
                </abbr>
                {numberOfComments > 0 ? (
                    <small>
                        <Badge pill color="primary" className="ml-2">
                            {numberOfComments}
                        </Badge>
                    </small>
                ) : null}
            </mark>
        );
    }

    buildComments(comments: CommentDto[], canEdit: boolean, canDelete: boolean) {
        const { linkedEntityId, linkedEntityType } = this.props;

        if (comments.length > 0) {
            return (
                <div>
                    <ListGroup className="my-3">
                        {comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                entityId={linkedEntityId}
                                entityType={linkedEntityType}
                                comment={comment}
                                canEdit={canEdit && !this.props.immutableThread}
                                canDelete={canDelete && !this.props.immutableThread}
                            />
                        ))}
                    </ListGroup>
                </div>
            );
        } else {
            return (
                <Alert color="primary" className="mt-3 d-flex">
                    <div className="my-auto mr-3">
                        <FontAwesomeIcon icon={faInfo} size="lg" />
                    </div>
                    <div>No comments to be displayed.</div>
                </Alert>
            );
        }
    }

    buildCommentThreadContent(canCreate: boolean, canEdit: boolean, canDelete: boolean) {
        const {
            linkedEntityId,
            linkedEntityType,
            commentThreadId,
        } = this.props;

        if (
            // If comment thread for this entity does not exist in the application state
            // and the entity does not seem to have a comment thread, show create thread option
            (this.props.commentThread(linkedEntityId, linkedEntityType) ==
                null &&
                commentThreadId == null) ||
            this.props.commentThread(linkedEntityId, linkedEntityType) == null
        ) {
            return (
                <div>
                    <Alert color="primary" className="mt-3 d-flex">
                        <div className="my-auto mr-3">
                            <FontAwesomeIcon icon={faInfo} size="lg" />
                        </div>
                        <div>No comments to be displayed.</div>
                    </Alert>
                    {canCreate && !this.props.immutableThread &&
                        <Button
                            outline
                            block
                            color="primary"
                            size="md"
                            onClick={() => this.toggleCreateCommentThreadModal()}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            Add comment
                        </Button>
                    }
                    <CommentThreadCreatorModal
                        onCloseModal={this.toggleCreateCommentThreadModal}
                        linkedEntityId={linkedEntityId}
                        linkedEntityType={linkedEntityType}
                        isOpen={this.state.commentThreadCreatorModalOpen}
                    />
                </div>
            );
        } else {
            const { comments, id, type } = this.props.commentThread(
                linkedEntityId,
                linkedEntityType,
            )!;
            return (
                <div>
                    {this.buildComments(comments, canEdit, canDelete)}
                    {canCreate && !this.props.immutableThread &&
                        <Button
                            outline
                            block
                            color="primary"
                            size="md"
                            onClick={() => this.toggleCreateCommentModal()}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            Add comment
                        </Button>
                    }
                    <CommentCreatorModal
                        entityId={linkedEntityId}
                        entityType={linkedEntityType}
                        commentThreadId={id}
                        commentThreadType={type}
                        onCloseModal={this.toggleCreateCommentModal}
                        isOpen={this.state.commentCreatorModalOpen}
                    />
                </div>
            );
        }
    }
}

export default withRouter(connect(
    (state: ApplicationState) => ({
        commentThread: (entityId: number, entityType: EntityType) =>
            getCommentThread(state, entityId, entityType),
        coursePermissions: getCoursePermissions(state),
    }),
    { fetchCommentThread: commentThreadRequestedAction },
)(CommentThread));
