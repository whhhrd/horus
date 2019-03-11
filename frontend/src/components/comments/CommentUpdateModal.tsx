import { Component } from "react";
import React from "react";
import { Formik, Field } from "formik";
import { CommentCreateDto, CommentUpdateDto, CommentDto, CommentType } from "../../api/types";
import { Form, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";
import { ApplicationState } from "../../state/state";
import { connect } from "react-redux";
import { commentUpdateRequestedAction } from "../../state/comments/action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface CommentUpdateModalProps {

    isOpen: boolean;
    commentThreadID: number;
    commentThreadType: CommentType;
    comment: CommentDto;

    updateComment: (commentID: number, commentUpdate: CommentUpdateDto) => {
        type: string,
    };

    onCloseModal: () => void;
}

class CommentUpdateModal extends Component<CommentUpdateModalProps> {

    constructor(props: CommentUpdateModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (commentUpdate: CommentCreateDto) => {
        this.props.updateComment(this.props.comment.id, commentUpdate);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>{"Editing comment"}</ModalHeader>
                {this.props.isOpen && <Formik
                    initialValues={{
                        threadId: this.props.commentThreadID,
                        content: this.props.comment.content,
                    }}
                    onSubmit={this.onSubmit}>
                    {({ handleSubmit }) => (
                        <div>
                            <ModalBody>
                                <Form>
                                    {this.props.commentThreadType === "PUBLIC" ?
                                        <Alert color="warning">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                            This comment will be visible to designated students.
                                        </Alert> : null}
                                    <Field component="textarea" className="p-2 w-100" name="content" />
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
                                    Edit
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
}), { updateComment: commentUpdateRequestedAction })(CommentUpdateModal);
