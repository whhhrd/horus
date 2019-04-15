import React, { Component } from "react";
import { connect } from "react-redux";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import {
    labelDeleteAction,
    LabelDeleteAction,
} from "../../../../state/labels/action";

interface LabelDeleteModalProps {
    isOpen: boolean;
    courseId: number;
    labelId: number;

    deleteLabel: (courseId: number, labelId: number) => LabelDeleteAction;

    onCloseModal: () => void;
}

/**
 * A modal that allows the permitted user to delete a label.
 */
class LabelDeleteModal extends Component<LabelDeleteModalProps> {
    render() {
        const {
            isOpen,
            onCloseModal,
            deleteLabel,
            labelId,
            courseId,
        } = this.props;

        return (
            <Modal isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>Delete label</ModalHeader>
                <ModalBody>
                    <span>Are you sure you want to delete this label?</span>
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        className="mr-3"
                        color="secondary"
                        onClick={onCloseModal}
                    >
                        No
                    </Button>
                    <Button
                        block
                        color="primary"
                        onClick={() => {
                            deleteLabel(courseId, labelId);
                            onCloseModal();
                        }}
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
        deleteLabel: (courseId: number, labelId: number) =>
            labelDeleteAction(courseId, labelId),
    },
)(LabelDeleteModal);
