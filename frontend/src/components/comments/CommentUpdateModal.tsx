import { Component } from "react";
import React from "react";
import { Formik, Field } from "formik";
import {
    CommentCreateDto,
    CommentUpdateDto,
    CommentDto,
    CommentType,
} from "../../api/types";
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
    commentUpdateRequestedAction,
    CommentUpdateRequestAction,
} from "../../state/comments/action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { EntityType } from "../../state/comments/types";

interface CommentUpdateModalProps {
    isOpen: boolean;
    entityId: number;
    entityType: EntityType;
    commentThreadType: CommentType;
    comment: CommentDto;

    updateComment: (
        entityId: number,
        entityType: EntityType,
        commentId: number,
        commentUpdate: CommentUpdateDto,
    ) => CommentUpdateRequestAction;

    onCloseModal: () => void;
}

class CommentUpdateModal extends Component<CommentUpdateModalProps> {
    constructor(props: CommentUpdateModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (commentUpdate: CommentCreateDto) => {
        this.props.updateComment(
            this.props.entityId,
            this.props.entityType,
            this.props.comment.id,
            commentUpdate,
        );
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    {"Editing comment"}
                </ModalHeader>
                {this.props.isOpen && (
                    <Formik
                        initialValues={{
                            threadId: this.props.entityId,
                            content: this.props.comment.content,
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values, isValid  }) => (
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
                                            autoFocus={true}
                                            component="textarea"
                                            className="p-2 w-100"
                                            name="content"
                                            isvalid={
                                                String((values.content.trim().length > 0))
                                            }
                                            onKeyDown={(event: KeyboardEvent) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey
                                                ) {
                                                    event.preventDefault();
                                                    if (isValid) {
                                                        handleSubmit();
                                                    }
                                                }
                                            }}
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
                                        disabled={!isValid}
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        Edit
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
    { updateComment: commentUpdateRequestedAction },
)(CommentUpdateModal);
