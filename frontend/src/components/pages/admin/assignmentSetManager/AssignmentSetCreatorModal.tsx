import React, { Component, RefObject } from "react";
import {
    Input,
    Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Label, Form,
} from "reactstrap";
import { connect } from "react-redux";
import { ApplicationState } from "../../../../state/state";
import {
    assignmentSetCreateRequestedAction,
} from "../../../../state/assignments/actions";
import { AssignmentSetCreateDto } from "../../../../state/types";
import { Formik, Field } from "formik";

interface AssignmentSetCreatorModalProps {
    isOpen: boolean;
    courseID: number;

    createAssignmentSet: (courseID: number, assignmentSetCreateDto: AssignmentSetCreateDto) => {
        type: string,
    };

    onCloseModal: () => void;
}

class AssignmentSetCreatorModal extends Component<AssignmentSetCreatorModalProps> {

    inputRef: RefObject<HTMLInputElement>;

    constructor(props: AssignmentSetCreatorModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.inputRef = React.createRef();
    }

    focusInput() {
        if (this.inputRef.current != null) {
            this.inputRef.current!.focus();
        }
    }

    onSubmit = (assignmentSetCreateDto: AssignmentSetCreateDto) => {
        this.props.createAssignmentSet(this.props.courseID, assignmentSetCreateDto);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>{"Create an assignment set"}</ModalHeader>
                <Formik
                    initialValues={{
                        name: "",
                    }}
                    onSubmit={this.onSubmit}>
                    {({ handleSubmit, values, isValid }) => (
                        <div>
                            <ModalBody>
                                <Form>
                                    <Label>Assignment set name</Label>
                                    <Input
                                        tag={Field}
                                        innerRef={this.inputRef}
                                        name="name"
                                        valid={values.name.trim().length > 0}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey) {
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
                                <Button block size="md" color="secondary" outline onClick={this.onCloseModal}>
                                    Cancel
                                </Button>
                                <Button
                                    disabled={!isValid}
                                    block size="md"
                                    color="primary"
                                    onClick={() => { handleSubmit(); }}
                                >
                                    Create
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal >
        );
    }
}

export default connect((_: ApplicationState) => ({
}), {
        createAssignmentSet: assignmentSetCreateRequestedAction,
    })(AssignmentSetCreatorModal);
