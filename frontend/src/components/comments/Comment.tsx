import React, { Component } from "react";
import { CommentDto } from "../../api/types";
import { ListGroupItem, Popover, PopoverHeader, PopoverBody, Button, CardTitle } from "reactstrap";
import { getDisplayedDate } from "../util";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CommentUpdateModal from "./CommentUpdateModal";
import { CommentDeleteRequestAction, commentDeleteRequestedAction } from "../../state/comments/action";
import { connect } from "react-redux";
import { ApplicationState } from "../../state/state";

interface CommentProps {
    comment: CommentDto;

    deleteComment: (comment: CommentDto) => CommentDeleteRequestAction;
}

interface CommentState {
    editorModalOpen: boolean;
    deleteCommentPopover: boolean;
}

export class Comment extends Component<CommentProps, CommentState> {

    constructor(props: CommentProps) {
        super(props);
        this.state = {
            editorModalOpen: false,
            deleteCommentPopover: false,
        };
        this.toggleEditorModal = this.toggleEditorModal.bind(this);
        this.toggleDeleteCommentPopover = this.toggleDeleteCommentPopover.bind(this);
    }

    toggleEditorModal() {
        this.setState((state) => ({ editorModalOpen: !state.editorModalOpen }));
    }

    toggleDeleteCommentPopover() {
        this.setState((state) => ({ deleteCommentPopover: !state.deleteCommentPopover }));
    }

    render() {
        const { content, createdAt, id, lastEditedAt, person, thread } = this.props.comment;

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
                                <small className="text-muted">{getDisplayedDate(createdAtDate)}</small>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <span onClick={() => this.toggleEditorModal()}>
                                <FontAwesomeIcon className="ml-3 cursor-pointer" icon={faEdit} size="sm" />
                            </span>
                            <span
                                id={`DeletePopoverTarget-${this.props.comment.id}`}
                                onClick={() => this.toggleDeleteCommentPopover()}>
                                <FontAwesomeIcon className="ml-3 cursor-pointer" icon={faTrash} size="sm" />
                            </span>
                            <Popover placement="left"
                                className="shadow"
                                isOpen={this.state.deleteCommentPopover}
                                target={`DeletePopoverTarget-${this.props.comment.id}`}
                                toggle={this.toggleDeleteCommentPopover}>
                                <PopoverHeader>
                                    <CardTitle>Delete this comment?</CardTitle>
                                </PopoverHeader>
                                <PopoverBody>
                                    <span>Are you sure you want to delete this comment?</span>
                                    <div className="d-flex flex-row">
                                        <Button block
                                            className="mr-3"
                                            color="secondary"
                                            onClick={this.toggleDeleteCommentPopover}>
                                            No
                                        </Button>
                                        <Button block
                                            color="primary"
                                            onClick={() => this.props.deleteComment(this.props.comment)}>
                                            Yes
                                        </Button>
                                    </div>
                                </PopoverBody>
                            </Popover>
                        </div>
                    </div>
                    {content}
                    {isModified ?
                        <small
                            className="text-muted"><br />
                            (last edited {getDisplayedDate(lastEditedAtDate)})
                        </small> : null}
                </div>
                <CommentUpdateModal
                    commentThreadID={id}
                    commentThreadType={thread.type}
                    comment={this.props.comment}
                    onCloseModal={this.toggleEditorModal}
                    isOpen={this.state.editorModalOpen} />
            </ListGroupItem>
        );
    }
}

export default connect((_: ApplicationState) => ({}), {
    deleteComment: (comment: CommentDto) => commentDeleteRequestedAction(comment),
})(Comment);
