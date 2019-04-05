import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { CommentDto } from "../../api/types";

import { EntityType } from "../../state/comments/types";
import {
    CommentDeleteRequestAction,
    commentDeleteRequestedAction,
} from "../../state/comments/action";

interface CommentDeleteModalProps {
    isOpen: boolean;
    entityId: number;
    entityType: EntityType;
    comment: CommentDto;

    deleteComment: (
        entityId: number,
        entityType: EntityType,
        comment: CommentDto,
    ) => CommentDeleteRequestAction;

    onCloseModal: () => void;
}

/**
 * A modal that allows the user to delete the desired comment.
 */
class CommentDeleteModal extends PureComponent<CommentDeleteModalProps> {
    render() {
        const {
            isOpen,
            onCloseModal,
            entityId,
            entityType,
            comment,
            deleteComment,
        } = this.props;

        return (
            <Modal isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>Delete comment</ModalHeader>
                <ModalBody>
                    <span>Are you sure you want to delete this comment?</span>
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        className="mr-3"
                        color="secondary"
                        outline
                        onClick={onCloseModal}
                    >
                        No
                    </Button>
                    <Button
                        block
                        color="success"
                        onClick={() =>
                            deleteComment(entityId, entityType, comment)
                        }
                    >
                        Yes
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default connect(
    () => ({}),
    {
        deleteComment: (
            entityId: number,
            entityType: EntityType,
            comment: CommentDto,
        ) => commentDeleteRequestedAction(entityId, entityType, comment),
    },
)(CommentDeleteModal);
