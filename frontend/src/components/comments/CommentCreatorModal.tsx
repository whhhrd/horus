import React, { PureComponent, Fragment, KeyboardEvent } from "react";
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

import { CommentCreateDto, CommentType } from "../../api/types";
import { ApplicationState } from "../../state/state";

import { EntityType } from "../../state/comments/types";
import {
    commentCreateRequestedAction,
    CommentCreateRequestAction,
} from "../../state/comments/action";

import { Formik, Field } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

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

/**
 * A modal that allows the user to create a comment.
 */
class CommentCreatorModal extends PureComponent<CommentCreatorModalProps> {
    onSubmit = (commentCreate: CommentCreateDto) => {
        this.props.createComment(
            this.props.entityId,
            this.props.entityType,
            commentCreate,
        );
        this.props.onCloseModal();
    }

    isValid(values: CommentCreateDto) {
        return values.content.trim().length > 0;
    }

    render() {
        const {
            isOpen,
            onCloseModal,
            commentThreadId,
            commentThreadType,
        } = this.props;

        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Creating comment"}
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={{
                            threadId: commentThreadId,
                            content: "",
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
                                        Create
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
    { createComment: commentCreateRequestedAction },
)(CommentCreatorModal);
