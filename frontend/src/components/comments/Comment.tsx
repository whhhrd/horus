import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";

import { ListGroupItem } from "reactstrap";

import CoursePermissions from "../../api/permissions";
import { CommentDto, ParticipantDtoBrief } from "../../api/types";
import { ApplicationState } from "../../state/state";
import { getCoursePermissions } from "../../state/auth/selectors";

import { EntityType } from "../../state/comments/types";

import { getDisplayedDate } from "../util";
import CommentUpdateModal from "./CommentUpdateModal";
import CommentDeleteModal from "./CommentDeleteModal";

import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    commentAnyEdit,
    commentAnyDelete,
    commentOwnEdit,
} from "../../state/auth/constants";
import {
    CurrentParticipantRequestedAction,
    currentParticipantRequestedAction,
} from "../../state/queuing/actions";
import { getCurrentParticipant } from "../../state/queuing/selectors";

interface CommentProps {
    entityId: number;
    entityType: EntityType;
    comment: CommentDto;
    mutable: boolean;

    currentParticipant: ParticipantDtoBrief | null;
    requestCurrentParticipant: (
        cid: number,
    ) => CurrentParticipantRequestedAction;

    permissions: CoursePermissions | null;
}

interface CommentState {
    editorModalOpen: boolean;
    deleteModalOpen: boolean;
}

/**
 * A component that represents a comment in a comment thread. Shows
 * information such as the author, comment content, creation/modification date
 * and, depending on the props 'canEdit' and 'canDelete', allows for editing and
 * deleting the comment.
 */
class Comment extends Component<
    CommentProps & RouteComponentProps<any>,
    CommentState
> {
    constructor(props: CommentProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            editorModalOpen: false,
            deleteModalOpen: false,
        };
        this.toggleEditorModal = this.toggleEditorModal.bind(this);
        this.toggleDeleteCommentModal = this.toggleDeleteCommentModal.bind(
            this,
        );
    }

    componentDidMount() {
        if (this.props.currentParticipant == null) {
            this.props.requestCurrentParticipant(this.props.match.params.cid);
        }
    }

    toggleEditorModal() {
        this.setState((state) => ({ editorModalOpen: !state.editorModalOpen }));
    }

    toggleDeleteCommentModal() {
        this.setState((state) => ({
            deleteModalOpen: !state.deleteModalOpen,
        }));
    }

    render() {
        const {
            content,
            createdAt,
            lastEditedAt,
            person,
            thread,
        } = this.props.comment;

        const {
            entityId,
            entityType,
            permissions,
            currentParticipant,
            mutable,
        } = this.props;
        const cid = this.props.match.params.cid;

        // Get the required permissions
        const canEditAll = commentAnyEdit.check(cid, permissions!);
        const canEditOwn = commentOwnEdit.check(cid, permissions!);
        const canDelete = commentAnyDelete.check(cid, permissions!);

        // Determine actual edit permission
        const canEdit =
            canEditAll ||
            (currentParticipant != null &&
                canEditOwn &&
                person.id === currentParticipant.person.id);

        const createdAtDate: Date = new Date(createdAt);
        const lastEditedAtDate: Date = new Date(lastEditedAt);

        const isModified = lastEditedAtDate.getTime() > createdAtDate.getTime();

        return (
            <ListGroupItem>
                <div className="px-1">
                    <div className="mb-1 d-flex pb-2 justify-content-between border-bottom">
                        <div className="pr-2 d-flex flex-wrap">
                            <div className="flex-shrink-0 mr-1">
                                <mark>{person.fullName}</mark>
                            </div>
                            <div className="flex-shrink-0">
                                <small className="text-muted">
                                    {getDisplayedDate(createdAtDate)}
                                </small>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {canEdit && mutable && (
                                <span onClick={() => this.toggleEditorModal()}>
                                    <FontAwesomeIcon
                                        className="ml-3 cursor-pointer"
                                        icon={faEdit}
                                        size="sm"
                                    />
                                </span>
                            )}
                            {canDelete && mutable && (
                                <span
                                    onClick={() =>
                                        this.toggleDeleteCommentModal()
                                    }
                                >
                                    <FontAwesomeIcon
                                        className="ml-3 cursor-pointer"
                                        icon={faTrash}
                                        size="sm"
                                    />
                                </span>
                            )}
                            <CommentDeleteModal
                                isOpen={this.state.deleteModalOpen}
                                entityId={entityId}
                                entityType={entityType}
                                comment={this.props.comment}
                                onCloseModal={this.toggleDeleteCommentModal}
                            />
                        </div>
                    </div>
                    {content}
                    {isModified && (
                        <small className="text-muted">
                            <br />
                            (last edited {getDisplayedDate(lastEditedAtDate)})
                        </small>
                    )}
                </div>
                <CommentUpdateModal
                    entityId={entityId}
                    entityType={entityType}
                    commentThreadType={thread.type}
                    comment={this.props.comment}
                    onCloseModal={this.toggleEditorModal}
                    isOpen={this.state.editorModalOpen}
                />
            </ListGroupItem>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            permissions: getCoursePermissions(state),
            currentParticipant: getCurrentParticipant(state),
        }),
        {
            requestCurrentParticipant: currentParticipantRequestedAction,
        },
    )(Comment),
);
