import React, { PureComponent, KeyboardEvent, Fragment } from "react";
import { connect } from "react-redux";

import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from "reactstrap";

import { CommentThreadCreateDto } from "../../api/types";
import { ApplicationState } from "../../state/state";

import { EntityType } from "../../state/comments/types";
import {
    commentThreadCreateRequestedAction,
    CommentThreadCreateAction,
} from "../../state/comments/action";

import { Formik, Field } from "formik";

interface CommentThreadCreatorModalProps {
    isOpen: boolean;
    entityId: number;
    entityType: EntityType;

    createCommentThread: (
        linkedEntityId: number,
        linkedEntityType: EntityType,
        commentThreadCreate: CommentThreadCreateDto,
    ) => CommentThreadCreateAction;

    onCloseModal: () => void;
}

/**
 * A modal that allows the user to create a comment thread. The
 * component looks exactly like the CommentCreatorModal, since we do
 * not provide the option to change the visibility of the comment thread.
 */
class CommentThreadCreatorModal extends PureComponent<
    CommentThreadCreatorModalProps
> {
    onSubmit = (commentThreadCreate: CommentThreadCreateDto) => {
        this.props.createCommentThread(
            this.props.entityId,
            this.props.entityType,
            commentThreadCreate,
        );
        this.props.onCloseModal();
    }

    isValid(values: CommentThreadCreateDto) {
        return values.content.trim().length > 0;
    }

    render() {
        const { isOpen, onCloseModal } = this.props;

        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Creating comment"}
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={{
                            content: "",
                            type: "STAFF_ONLY",
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <Fragment>
                                <ModalBody>
                                    <Form>
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
                                        color="primary"
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
    { createCommentThread: commentThreadCreateRequestedAction },
)(CommentThreadCreatorModal);
