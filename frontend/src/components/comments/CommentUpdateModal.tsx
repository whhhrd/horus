import React, { Component, KeyboardEvent, Fragment } from "react";
import { connect } from "react-redux";

import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert,
    Input,
} from "reactstrap";

import {
    CommentCreateDto,
    CommentUpdateDto,
    CommentDto,
    CommentType,
} from "../../api/types";
import { ApplicationState } from "../../state/state";

import { EntityType } from "../../state/comments/types";
import {
    commentUpdateRequestedAction,
    CommentUpdateRequestAction,
} from "../../state/comments/action";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { Formik, Field } from "formik";

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

/**
 * A modal that allows the user to edit a comment.
 */
class CommentUpdateModal extends Component<CommentUpdateModalProps> {
    onSubmit = (commentUpdate: CommentCreateDto) => {
        this.props.updateComment(
            this.props.entityId,
            this.props.entityType,
            this.props.comment.id,
            commentUpdate,
        );
        this.props.onCloseModal();
    }

    isValid(values: CommentUpdateDto) {
        return values.content.trim().length > 0;
    }

    render() {
        const {
            isOpen,
            onCloseModal,
            entityId,
            comment,
            commentThreadType,
        } = this.props;

        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Editing comment"}
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={{
                            threadId: entityId,
                            content: comment.content,
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <Fragment>
                                <ModalBody>
                                    <Form>
                                        {commentThreadType === "PUBLIC" ? (
                                            <Alert color="warning">
                                                <FontAwesomeIcon
                                                    icon={faExclamationTriangle}
                                                    className="mr-2"
                                                />
                                                This comment will be visible to
                                                designated students.
                                            </Alert>
                                        ) : null}
                                        <Input
                                            tag={Field}
                                            autoFocus={true}
                                            component="textarea"
                                            className="p-2 w-100"
                                            name="content"
                                            valid={this.isValid(values)}
                                            invalid={!this.isValid(values)}
                                            onKeyDown={(
                                                event: KeyboardEvent,
                                            ) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey
                                                ) {
                                                    event.preventDefault();
                                                    if (this.isValid(values)) {
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
                                        onClick={onCloseModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        block
                                        size="md"
                                        color="success"
                                        disabled={!this.isValid(values)}
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </ModalFooter>
                            </Fragment>
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
