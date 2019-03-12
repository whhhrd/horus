import React, { Component } from "react";
import { CommentDto } from "../../api/types";
import {
    ListGroupItem,
} from "reactstrap";
import { getDisplayedDate } from "../util";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CommentUpdateModal from "./CommentUpdateModal";
import { connect } from "react-redux";
import { ApplicationState } from "../../state/state";
import { EntityType } from "../../state/comments/types";
import CommentDeleteModal from "./CommentDeleteModal";

interface CommentProps {
    entityId: number;
    entityType: EntityType;
    comment: CommentDto;
}

interface CommentState {
    editorModalOpen: boolean;
    deleteModalOpen: boolean;
}

export class Comment extends Component<CommentProps, CommentState> {
    constructor(props: CommentProps) {
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

        const { entityId, entityType } = this.props;

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
                            <span onClick={() => this.toggleEditorModal()}>
                                <FontAwesomeIcon
                                    className="ml-3 cursor-pointer"
                                    icon={faEdit}
                                    size="sm"
                                />
                            </span>
                            <span
                                onClick={() => this.toggleDeleteCommentModal()}
                            >
                                <FontAwesomeIcon
                                    className="ml-3 cursor-pointer"
                                    icon={faTrash}
                                    size="sm"
                                />
                            </span>
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
                    {isModified ? (
                        <small className="text-muted">
                            <br />
                            (last edited {getDisplayedDate(lastEditedAtDate)})
                        </small>
                    ) : null}
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

export default connect(
    (_: ApplicationState) => ({}),
    {},
)(Comment);
