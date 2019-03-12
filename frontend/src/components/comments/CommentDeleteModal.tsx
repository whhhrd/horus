import { Component } from "react";
import React from "react";
import { CommentDto } from "../../api/types";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
    CommentDeleteRequestAction,
    commentDeleteRequestedAction,
} from "../../state/comments/action";
import { EntityType } from "../../state/comments/types";
import { connect } from "react-redux";
import { ApplicationState } from "../../state/state";
import ModalFooter from "reactstrap/lib/ModalFooter";

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

class CommentDeleteModal extends Component<CommentDeleteModalProps> {
    constructor(props: CommentDeleteModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    Delete comment
                </ModalHeader>
                <ModalBody>
                    <span>Are you sure you want to delete this comment?</span>
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        className="mr-3"
                        color="secondary"
                        onClick={this.onCloseModal}
                    >
                        No
                    </Button>
                    <Button
                        block
                        color="primary"
                        onClick={() =>
                            this.props.deleteComment(
                                this.props.entityId,
                                this.props.entityType,
                                this.props.comment,
                            )
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
    (_: ApplicationState) => ({}),
    {
        deleteComment: (
            entityId: number,
            entityType: EntityType,
            comment: CommentDto,
        ) => commentDeleteRequestedAction(entityId, entityType, comment),
    },
)(CommentDeleteModal);
