import React, { Component } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";

import {
    Button,
    Collapse,
    Alert,
    ListGroup,
    Card,
    CardTitle,
    Badge,
    CardBody,
} from "reactstrap";

import CoursePermissions from "../../api/permissions";
import { CommentThreadDtoFull, CommentDto } from "../../api/types";
import { ApplicationState } from "../../state/state";
import {
    commentAnyCreate,
    viewCommentSidebar,
} from "../../state/auth/constants";

import { getCoursePermissions } from "../../state/auth/selectors";
import { getCommentThread } from "../../state/comments/selectors";

import { EntityType } from "../../state/comments/types";
import {
    CommentThreadRequestedAction,
    commentThreadRequestedAction,
} from "../../state/comments/action";

import CommentCreatorModal from "./CommentCreatorModal";
import CommentThreadCreatorModal from "./CommentThreadCreatorModal";
import Comment from "../comments/Comment";

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

interface CommentThreadProps {
    entityId: number;
    entityType: EntityType;

    commentThreadId: number | null;
    commentThreadSubject: string;
    commentThreadMutable?: boolean;
    commentThreadOpen: boolean;

    coursePermissions: CoursePermissions | null;

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
 * Creates a comment thread component, showing the entity the comment thread is about
 * and the comments linked to this comment thread.
 *
 * In order to use a CommentThread, you have to specify certain props, namely:
 * @property entityId This is the ID of the participant, group, assignment or signoff result
 * @property entityType This is the type of the entity. Use EntityType to specify it to your needs
 * @property commentThreadId This is the commentThreadId that is part of the entity's CommentThreadDtoBrief (except for
 *     SignOffResultDtoCompact, use the actual commentThreadId there). See example usage below.
 * @property commendThreadSubject This will be the highlighted part of the comment thread title.
 * @property commentThreadOpen Determines whether the comment thread is collapsed or not.
 * @proporty commentThreadMutable (optional) Determines whether comments can be added/removed from the comment thread
 */
class CommentThread extends Component<
    CommentThreadProps & RouteComponentProps<any>,
    CommentThreadState
> {
    static defaultProps = {
        commentThreadMutable: true,
    };

    constructor(props: CommentThreadProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            commentCreatorModalOpen: false,
            commentThreadCreatorModalOpen: false,
            showCommentThreadContent: props.commentThreadOpen,
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
            entityId,
            entityType,
            commentThreadId,
            fetchCommentThread,
        } = this.props;

        if (commentThreadId != null) {
            fetchCommentThread(entityId, entityType);
        }
    }

    componentDidUpdate(prevProps: CommentThreadProps) {
        const {
            entityId,
            entityType,
            commentThreadId,
            fetchCommentThread,
        } = this.props;

        if (commentThreadId != null && prevProps.entityId !== entityId) {
            fetchCommentThread(entityId, entityType);
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
        const { entityType } = this.props;
        const cid = this.props.match.params.cid;

        // Get required permissions
        const permissions = this.props.coursePermissions!;
        const canView = viewCommentSidebar.check(cid, permissions);
        const canCreate = commentAnyCreate.check(cid, permissions);

        if (!canView) {
            return null;
        } else {
            // Determine left border color of the comment thread
            // and the title prefix.
            let borderColor: string;
            let titleEntityPrefix: string;
            switch (entityType) {
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
                            <Collapse
                                isOpen={this.state.showCommentThreadContent}
                            >
                                {this.buildCommentThreadContent(canCreate)}
                            </Collapse>
                        </CardBody>
                    </Card>
                </div>
            );
        }
    }

    /**
     * Builds the comment thread title content. Contains an icon, a title concerning
     * the entity and the number of comments.
     * @param titlePrefix The title to be displayed in the comment thread 'header'
     */
    buildCommentThreadTitle(titlePrefix: string) {
        const {
            commentThread,
            entityType,
            entityId,
            commentThreadSubject,
        } = this.props;

        // Determine icon to be displayed in comment thread title
        let iconElement: IconDefinition | null;
        switch (entityType) {
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
            commentThread(entityId, entityType) != null
                ? commentThread(entityId, entityType)!.comments.length
                : 0;

        return (
            <mark className="px-2">
                <abbr
                    title={`Comments about ${titlePrefix}${commentThreadSubject}`}
                >
                    <FontAwesomeIcon className="mr-2" icon={iconElement!} />
                    {commentThreadSubject}
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

    /**
     * Builds the comments linked to this comment thread. An Alert is returnt when
     * there are no comments to be displayed (i.e. the comment thread is empty)
     * @param comments The comments that are to be displayed
     */
    buildComments(comments: CommentDto[]) {
        const { entityId, entityType, commentThreadMutable } = this.props;

        if (comments.length > 0) {
            return (
                <div>
                    <ListGroup className="my-3">
                        {comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                entityId={entityId}
                                entityType={entityType}
                                comment={comment}
                                mutable={commentThreadMutable!}
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

    /**
     * Builds the comment thread content, based on the availability of
     * comments and comment thread.
     * @param canCreate A boolean indicating whether the user can create comments
     */
    buildCommentThreadContent(canCreate: boolean) {
        const {
            entityId,
            entityType,
            commentThreadId,
            commentThreadMutable,
            commentThread,
        } = this.props;

        if (
            // If comment thread for this entity does not exist in the application state
            // and the entity does not seem to have a comment thread, show create thread option
            (commentThread(entityId, entityType) == null &&
                commentThreadId == null) ||
            commentThread(entityId, entityType) == null
        ) {
            return (
                <div>
                    <Alert color="primary" className="mt-3 d-flex">
                        <div className="my-auto mr-3">
                            <FontAwesomeIcon icon={faInfo} size="lg" />
                        </div>
                        <div>No comments to be displayed.</div>
                    </Alert>
                    {canCreate && commentThreadMutable && (
                        <Button
                            outline
                            block
                            color="success"
                            size="md"
                            onClick={() =>
                                this.toggleCreateCommentThreadModal()
                            }
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Add comment
                        </Button>
                    )}
                    <CommentThreadCreatorModal
                        onCloseModal={this.toggleCreateCommentThreadModal}
                        entityId={entityId}
                        entityType={entityType}
                        isOpen={this.state.commentThreadCreatorModalOpen}
                    />
                </div>
            );
        } else {
            const { comments, id, type } = commentThread(entityId, entityType)!;
            return (
                <div>
                    {this.buildComments(comments)}
                    {canCreate && commentThreadMutable && (
                        <Button
                            outline
                            block
                            color="success"
                            size="md"
                            onClick={() => this.toggleCreateCommentModal()}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Add comment
                        </Button>
                    )}
                    <CommentCreatorModal
                        entityId={entityId}
                        entityType={entityType}
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

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            commentThread: (entityId: number, entityType: EntityType) =>
                getCommentThread(state, entityId, entityType),
            coursePermissions: getCoursePermissions(state),
        }),
        { fetchCommentThread: commentThreadRequestedAction },
    )(CommentThread),
);
