import React, { Component, KeyboardEvent } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Formik, Field } from "formik";

import {
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal,
    FormGroup,
    Label,
    Input,
    Button,
} from "reactstrap";
import { QueueDto, QueueUpdateDto } from "../../../api/types";

import {
    QueueEditRequestedAction,
    queueEditRequestedAction,
} from "../../../state/queuing/actions";

interface QueueEditModalProps {
    queue: QueueDto;
    isOpen: boolean;
    onCloseModal: () => void;
    editQueue: (
        courseId: number,
        roomCode: string,
        queueId: string,
        queueUpdate: QueueUpdateDto,
    ) => QueueEditRequestedAction;
}

interface QueueCreatorValues {
    name: string;
}

/**
 * A modal that allows the permitted user to edit a queue.
 */
class QueueEditModal extends Component<
    QueueEditModalProps & RouteComponentProps<any>
> {
    isValid(values: QueueCreatorValues) {
        return values.name.trim().length > 0;
    }

    render() {
        const { cid, rid } = this.props.match.params;
        const { queue } = this.props;
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.props.onCloseModal}>
                    Editing queue:{" "}
                    <span className="font-weight-bold">
                        {this.props.queue.name}
                    </span>
                </ModalHeader>
                <Formik
                    initialValues={{
                        name: queue.name,
                    }}
                    onSubmit={(result: QueueCreatorValues) => {
                        this.props.editQueue(Number(cid), rid, queue.id, {
                            name: result.name,
                        });
                        this.props.onCloseModal();
                    }}
                >
                    {({ handleSubmit, values }) => (
                        <div>
                            <ModalBody>
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
                                    Edit Queue
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }
}

export default withRouter(connect(
    () => ({}),
    { editQueue: queueEditRequestedAction },
)(QueueEditModal));
