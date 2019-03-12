import { Component } from "react";
import React from "react";
import { Formik, Field } from "formik";
import { CommentThreadCreateDto } from "../../api/types";
import { Form, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { ApplicationState } from "../../state/state";
import { connect } from "react-redux";
import { commentThreadCreateRequestedAction, CommentThreadCreateAction } from "../../state/comments/action";
import { EntityType } from "../../state/comments/types";

interface CommentThreadCreatorModalProps {
    isOpen: boolean;
    linkedEntityId: number;
    linkedEntityType: EntityType;

    createCommentThread: (
        linkedEntityId: number,
        linkedEntityType: EntityType,
        commentThreadCreate: CommentThreadCreateDto) => CommentThreadCreateAction;

    onCloseModal: () => void;
}

class CommentThreadCreatorModal extends Component<CommentThreadCreatorModalProps> {

    constructor(props: CommentThreadCreatorModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (commentThreadCreate: CommentThreadCreateDto) => {
        this.props.createCommentThread(this.props.linkedEntityId, this.props.linkedEntityType, commentThreadCreate);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>{"Creating comment thread"}</ModalHeader>
                {this.props.isOpen && <Formik
                    initialValues={{
                        content: "",
                        type: "STAFF_ONLY",
                    }}
                    onSubmit={this.onSubmit}>
                    {({ handleSubmit }) => (
                        <div>
                            <ModalBody>
                                <Form>
                                    <Field
                                        component="textarea"
                                        className="p-2 w-100"
                                        name="content"
                                        placeholder="Comment text..." />
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button block
                                    size="md"
                                    color="secondary"
                                    outline
                                    onClick={this.onCloseModal}>
                                    Cancel
                                </Button>
                                <Button block
                                    size="md"
                                    color="primary"
                                    onClick={() => { handleSubmit(); }}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
                }
            </Modal>
        );
    }
}

export default connect((_: ApplicationState) => ({
}), { createCommentThread: commentThreadCreateRequestedAction })(CommentThreadCreatorModal);
