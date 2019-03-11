import React, { PureComponent } from "react";

import { Formik, Field } from "formik";
import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
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
                <ModalHeader>{"Add comment"}</ModalHeader>
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
                                    {this.props.message}
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
                                        placeholder="Sign off comment..."
                                    />
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    size="md"
                                    color="danger"
                                    outline
                                    onClick={this.props.onCancelClick}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    color="secondary"
                                    outline
                                    onClick={this.props.onNoCommentClick}
                                >
                                    No Comment
                                </Button>
                                <Button
                                    size="md"
                                    color="primary"
                                    disabled={!isValid}
                                    onClick={() => handleSubmit()}
                                >
                                    Add Comment
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }
}
