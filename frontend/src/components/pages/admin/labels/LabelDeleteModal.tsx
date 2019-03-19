import { Component } from "react";
import React from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { connect } from "react-redux";
import ModalFooter from "reactstrap/lib/ModalFooter";
import { labelDeleteAction, LabelDeleteAction } from "../../../../state/labels/action";
import { ApplicationState } from "../../../../state/state";

interface LabelDeleteModalProps {
    isOpen: boolean;
    courseId: number;
    labelId: number;

    deleteLabel: (courseId: number, labelId: number) => LabelDeleteAction;

    onCloseModal: () => void;
}

class LabelDeleteModal extends Component<LabelDeleteModalProps> {
    constructor(props: LabelDeleteModalProps) {
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
                    Delete label
                </ModalHeader>
                <ModalBody>
                    <span>Are you sure you want to delete this label?</span>
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
                        onClick={() => {
                            this.props.deleteLabel(
                                this.props.courseId,
                                this.props.labelId,
                            );
                            this.onCloseModal();
                        }
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
        deleteLabel: (
            courseId: number,
            labelId: number,
        ) => labelDeleteAction(courseId, labelId),
    },
)(LabelDeleteModal);
