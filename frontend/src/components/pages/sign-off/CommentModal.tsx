import React, { PureComponent } from "react";

import { Formik, Field } from "formik";
import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
} from "reactstrap";

export interface CommentModalProps {
    message: string;
    onCancelClick?: () => void;
    onNoCommentClick?: () => void;
    onCommentClick?: (comment: string) => void;
}

export default class CommentModal extends PureComponent<CommentModalProps> {
    constructor(props: CommentModalProps) {
        super(props);
    }

    onSubmit(values: { content: string }) {
        if (this.props.onCommentClick) {
            this.props.onCommentClick(values.content);
        }
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={true}>
                <ModalHeader>{"Mark as insufficient"}</ModalHeader>
                <Formik
                    initialValues={{
                        content: "",
                    }}
                    onSubmit={(values) => this.onSubmit(values)}
                >
                    {({ handleSubmit, values, isValid }) => (
                        <div>
                            <ModalBody>
                                <Form>
                                    <FormGroup>
                                        <div className="mb-1">{this.props.message}</div>
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
                                            placeholder="What is insufficient about the sign-off?"
                                        />
                                    </FormGroup>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    size="md"
                                    color="secondary"
                                    outline
                                    onClick={this.props.onCancelClick}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    color={isValid ? "warning" : "danger"}
                                    outline={!isValid}
                                    onClick={isValid ? () => handleSubmit() : this.props.onNoCommentClick}
                                >
                                    {isValid ? "Add comment and mark as insufficient" : "Mark as insufficient"}
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }
}
