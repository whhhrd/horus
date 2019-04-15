import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

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

import { ApplicationState } from "../../../../state/state";
import { LabelCreateUpdateDto } from "../../../../api/types";
import {
    LabelCreateAction,
    labelCreateAction,
} from "../../../../state/labels/action";

import { Formik, Field } from "formik";

interface LabelCreateModalProps {
    isOpen: boolean;
    courseId: number;

    createLabel: (
        courseId: number,
        labelCreate: LabelCreateUpdateDto,
    ) => LabelCreateAction;

    onCloseModal: () => void;
}

/**
 * A modal that allows the permitted user to create a label
 * with a name and a self-defined colour.
 */
class LabelCreateModal extends Component<LabelCreateModalProps> {
    onSubmit = (labelCreate: LabelCreateUpdateDto) => {
        labelCreate.color = labelCreate.color.replace("#", "");
        labelCreate.name = labelCreate.name.toLowerCase();
        this.props.createLabel(this.props.courseId, labelCreate);
        this.props.onCloseModal();
    }

    isValid(labelCreate: LabelCreateUpdateDto) {
        return labelCreate.name.trim().match("^[-a-z0-9]{1,15}$") != null;
    }

    render() {
        const { isOpen, onCloseModal } = this.props;
        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Create a new label"}
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={{
                            color: "#000000",
                            name: "",
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <Fragment>
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
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();
                                                        if (
                                                            this.isValid(values)
                                                        ) {
                                                            handleSubmit();
                                                        }
                                                    }
                                                }}
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
    { createLabel: labelCreateAction },
)(LabelCreateModal);
