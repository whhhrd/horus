import { Component } from "react";
import React from "react";
import { Formik, Field } from "formik";
import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    FormGroup,
    Input,
} from "reactstrap";
import { connect } from "react-redux";
import { ApplicationState } from "../../../../state/state";
import { LabelCreateUpdateDto } from "../../../../api/types";
import {
    LabelCreateAction,
    labelCreateAction,
} from "../../../../state/labels/action";

interface LabelCreateModalProps {
    isOpen: boolean;
    courseId: number;

    createLabel: (courseId: number, labelCreate: LabelCreateUpdateDto) => LabelCreateAction;

    onCloseModal: () => void;
}

class LabelCreateModal extends Component<LabelCreateModalProps> {
    constructor(props: LabelCreateModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (labelCreate: LabelCreateUpdateDto) => {
        labelCreate.color = labelCreate.color.replace("#", "");
        labelCreate.name = labelCreate.name.toLowerCase();
        this.props.createLabel(this.props.courseId, labelCreate);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    isValid(labelCreate: LabelCreateUpdateDto) {
        return (
            labelCreate.name.trim().match("^[-a-z0-9]{1,15}$") != null
        );
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    {"Create a new label"}
                </ModalHeader>
                {this.props.isOpen && (
                    <Formik
                        initialValues={{
                            color: "#000000",
                            name: "",
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <div>
                                <ModalBody>
                                    <Form>
                                        <FormGroup>
                                            <Label>Label name</Label>
                                            <Input
                                                tag={Field}
                                                name="name"
                                                maxLength={15}
                                                valid={this.isValid(values)}
                                                invalid={!this.isValid(values)}
                                                autoFocus={true}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Label color</Label>
                                            <Input
                                                tag={Field}
                                                type="color"
                                                name="color"
                                            />
                                        </FormGroup>
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
                                        disabled={!this.isValid(values)}
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
    { createLabel: labelCreateAction },
)(LabelCreateModal);
