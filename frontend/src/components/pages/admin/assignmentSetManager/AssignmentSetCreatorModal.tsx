import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import {
    Input,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    Form,
} from "reactstrap";

import { AssignmentSetCreateDto } from "../../../../api/types";
import { assignmentSetCreateRequestedAction } from "../../../../state/assignments/actions";

import { Formik, Field } from "formik";

interface AssignmentSetCreatorModalProps {
    isOpen: boolean;
    courseID: number;

    createAssignmentSet: (
        courseID: number,
        assignmentSetCreateDto: AssignmentSetCreateDto,
    ) => {
        type: string;
    };

    onCloseModal: () => void;
}

/**
 * A modal that allows the privileged user to create an assignment set.
 */
class AssignmentSetCreatorModal extends Component<
    AssignmentSetCreatorModalProps
> {
    onSubmit = (assignmentSetCreateDto: AssignmentSetCreateDto) => {
        this.props.createAssignmentSet(
            this.props.courseID,
            assignmentSetCreateDto,
        );
        this.props.onCloseModal();
    }

    render() {
        const { isOpen, onCloseModal } = this.props;
        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Create an assignment set"}
                </ModalHeader>
                <Formik
                    initialValues={{
                        name: "",
                    }}
                    onSubmit={this.onSubmit}
                >
                    {({ handleSubmit, values, isValid }) => (
                        <Fragment>
                            <ModalBody>
                                <Form>
                                    <Label>Assignment set name</Label>
                                    <Input
                                        tag={Field}
                                        name="name"
                                        autoFocus
                                        valid={values.name.trim().length > 0}
                                        onKeyDown={(event) => {
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
                                    onClick={onCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={!isValid}
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
                        </Fragment>
                    )}
                </Formik>
            </Modal>
        );
    }
}

export default connect(
    () => ({}),
    {
        createAssignmentSet: assignmentSetCreateRequestedAction,
    },
)(AssignmentSetCreatorModal);
