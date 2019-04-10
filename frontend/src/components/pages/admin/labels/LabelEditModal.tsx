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
import { LabelCreateUpdateDto, LabelDto } from "../../../../api/types";
import { LabelUpdateAction, labelUpdateAction } from "../../../../state/labels/action";

interface LabelEditModalProps {
    isOpen: boolean;
    courseId: number;
    label: LabelDto;

    updateLabel: (
        courseId: number,
        labelId: number,
        labelUpdate: LabelCreateUpdateDto,
    ) => LabelUpdateAction;

    onCloseModal: () => void;
}

class LabelEditModal extends Component<LabelEditModalProps> {
    constructor(props: LabelEditModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (labelUpdate: LabelCreateUpdateDto) => {
        labelUpdate.color = labelUpdate.color.replace("#", "");
        labelUpdate.name = labelUpdate.name.toLowerCase();
        this.props.updateLabel(
            this.props.courseId,
            this.props.label.id,
            labelUpdate,
        );
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    isValid(labelUpdate: LabelCreateUpdateDto) {
        return (
            labelUpdate.name.trim().match("^[-a-z0-9]{1,15}$") != null
        );
    }

    render() {
        const { isOpen, label } = this.props;
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    Editing label <strong>{label.name}</strong>
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={{
                            color: `#${label.color}`,
                            name: label.name,
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
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" && !event.shiftKey) {
                                                        event.preventDefault();
                                                        if (this.isValid(values)) {
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
    { updateLabel: labelUpdateAction },
)(LabelEditModal);
