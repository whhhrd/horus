import { Component, KeyboardEvent, FormEvent } from "react";
import React from "react";
import { Formik, Field } from "formik";
import { AssignmentSetDtoBrief } from "../../../api/types";
import {
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal,
    FormGroup,
    Label,
    Input,
    Button,
    ButtonGroup,
} from "reactstrap";

interface QueueCreateModalProps {
    isOpen: boolean;
    assignmentSets: AssignmentSetDtoBrief[];
    onCloseModal: () => void;
    onCreate: (name: string, assignmentSetId: number | null) => any;
}

interface QueueCreatorValues {
    name: string;
    assignmentSetId: number | null;
}

interface QueueCreateModalState {
    isSignOffQueue: boolean;
}

/**
 * A modal that allows the permitted user to create a queue.
 */
export default class QueueCreateModal extends Component<
    QueueCreateModalProps,
    QueueCreateModalState
> {
    constructor(props: QueueCreateModalProps) {
        super(props);
        this.state = {
            isSignOffQueue: false,
        };
    }

    isValid(values: QueueCreatorValues) {
        if (!this.state.isSignOffQueue) {
            return values.name.trim().length > 0;
        } else {
            return (
                values.name.trim().length > 0 && values.assignmentSetId !== -1
            );
        }
    }

    render() {
        const { isSignOffQueue } = this.state;
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={() => this.onCloseModal()}>
                    Creating a new queue
                </ModalHeader>
                <Formik
                    initialValues={{
                        name: "Questions",
                        assignmentSetId: -1,
                    }}
                    onSubmit={(result: QueueCreatorValues) => {
                        this.props.onCreate(
                            result.name,
                            result.assignmentSetId === -1 ||
                                !this.state.isSignOffQueue
                                ? null
                                : result.assignmentSetId,
                        );
                        this.onCloseModal();
                    }}
                >
                    {({ handleSubmit, values }) => (
                        <div>
                            <ModalBody>
                                <FormGroup className="d-flex flex-wrap">
                                    <Label className="d-block w-100 mb-0">
                                        Type of queue
                                    </Label>
                                    <ButtonGroup className="w-100">
                                        <Button
                                            color="primary"
                                            block
                                            outline={isSignOffQueue}
                                            onClick={() => {
                                                this.setState(() => ({
                                                    isSignOffQueue: false,
                                                }));
                                                values.assignmentSetId = -1;
                                            }}
                                        >
                                            Questions
                                        </Button>
                                        <Button
                                            color="primary"
                                            block
                                            outline={!isSignOffQueue}
                                            onClick={() => {
                                                this.setState(() => ({
                                                    isSignOffQueue: true,
                                                }));
                                                values.name = "";
                                            }}
                                        >
                                            Sign-off
                                        </Button>
                                    </ButtonGroup>
                                </FormGroup>
                                {isSignOffQueue && (
                                    <FormGroup>
                                        <Label>Assignment set</Label>
                                        <Field
                                            className="custom-select"
                                            component="select"
                                            name="assignmentSetId"
                                            id="assignmentSetId"
                                            onChange={(event: FormEvent) => {
                                                const targetId =
                                                    // @ts-ignore
                                                    Number(event.target.value);
                                                if (targetId !== -1) {
                                                    const assignmentSet = this.props.assignmentSets.find(
                                                        (a) =>
                                                            a.id === targetId,
                                                    );

                                                    if (assignmentSet != null) {
                                                        values.assignmentSetId = targetId;
                                                        values.name =
                                                            "Sign-off: " +
                                                            assignmentSet.name;
                                                    }
                                                } else {
                                                    values.name = "";
                                                    values.assignmentSetId = -1;
                                                }
                                                this.forceUpdate();
                                            }}
                                        >
                                            <option value={-1}>None</option>
                                            {this.props.assignmentSets!.map(
                                                (
                                                    assignmentSet: AssignmentSetDtoBrief,
                                                ) => (
                                                    <option
                                                        value={assignmentSet.id}
                                                        key={assignmentSet.id}
                                                    >
                                                        {assignmentSet.name}
                                                    </option>
                                                ),
                                            )}
                                        </Field>
                                    </FormGroup>
                                )}
                                <FormGroup>
                                    <Label>Queue name</Label>
                                    <Input
                                        tag={Field}
                                        autoFocus={true}
                                        id="name"
                                        name="name"
                                        valid={this.isValid(values)}
                                        invalid={!this.isValid(values)}
                                        onKeyDown={(event: KeyboardEvent) => {
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
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    block
                                    outline
                                    onClick={this.props.onCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    block
                                    disabled={!this.isValid(values)}
                                    onClick={() => handleSubmit()}
                                >
                                    Create Queue
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }

    onCloseModal() {
        this.props.onCloseModal();
    }
}
