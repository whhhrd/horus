import { Component } from "react";
import React from "react";
import { Formik, Field } from "formik";
import { CommentCreateDto, CommentType } from "../../api/types";
import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert,
} from "reactstrap";
import { ApplicationState } from "../../state/state";
import { connect } from "react-redux";
import {
    commentCreateRequestedAction,
    CommentCreateRequestAction,
} from "../../state/comments/action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { EntityType } from "../../state/comments/types";

interface CommentCreatorModalProps {
    isOpen: boolean;
    entityId: number;
    entityType: EntityType;
    commentThreadId: number;
    commentThreadType: CommentType;

    createComment: (
        entityId: number,
        entityType: EntityType,
        commentCreate: CommentCreateDto,
    ) => CommentCreateRequestAction;

    onCloseModal: () => void;
}

class CommentCreatorModal extends Component<CommentCreatorModalProps> {
    constructor(props: CommentCreatorModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (commentCreate: CommentCreateDto) => {
        this.props.createComment(
            this.props.entityId,
            this.props.entityType,
            commentCreate,
        );
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    {"Creating comment"}
                </ModalHeader>
                {this.props.isOpen && (
                    <Formik
                        initialValues={{
                            threadId: this.props.commentThreadId,
                            content: "",
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit }) => (
                            <div>
                                <ModalBody>
                                    <Form>
                                        {this.props.commentThreadType ===
                                        "PUBLIC" ? (
                                            <Alert color="warning">
                                                <FontAwesomeIcon
                                                    icon={faExclamationTriangle}
                                                    className="mr-2"
                                                />
                                                This comment will be visible to
                                                designated students.
                                            </Alert>
                                        ) : null}
                                        <Field
                                            component="textarea"
                                            className="p-2 w-100"
                                            name="content"
                                            placeholder="Comment text..."
                                        />
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        block
                                        size="md"
                                        color="secondary"
                                        outline
                                        onClick={this.onCloseModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        block
                                        size="md"
                                        color="primary"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        Create
                                    </Button>
                                </ModalFooter>
                            </div>
                        )}
                    </Formik>
                )}
            </Modal>
        );
    }
}

export default connect(
    (_: ApplicationState) => ({}),
    { createComment: commentCreateRequestedAction },
)(CommentCreatorModal);
