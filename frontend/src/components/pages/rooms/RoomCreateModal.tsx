import React, { Component } from "react";
import { connect } from "react-redux";
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

import { RoomCreateDto } from "../../../api/types";
import { roomOpenRequestedAction, RoomOpenRequestedAction } from "../../../state/rooms/action";
import { ApplicationState } from "../../../state/state";

interface RoomCreateModalProps {
    isOpen: boolean;
    courseId: number;

    openRoom: (
        courseId: number,
        roomCreate: RoomCreateDto,
    ) => RoomOpenRequestedAction;

    onCloseModal: () => void;
}

/**
 * A modal that allows the permitted user to create a room.
 */
class RoomCreateModal extends Component<RoomCreateModalProps> {
    onSubmit = (roomCreate: RoomCreateDto) => {
        this.props.openRoom(this.props.courseId, roomCreate);
        this.props.onCloseModal();
    }

    isValid(roomCreate: RoomCreateDto) {
        return roomCreate.name.trim().length > 0;
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.props.onCloseModal}>
                    {"Opening a new room"}
                </ModalHeader>
                {this.props.isOpen && (
                    <Formik
                        initialValues={{
                            name: "",
                        }}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <div>
                                <ModalBody>
                                    <Form>
                                        <FormGroup>
                                            <Label>Room name</Label>
                                            <Input
                                                tag={Field}
                                                name="name"
                                                valid={this.isValid(values)}
                                                invalid={!this.isValid(values)}
                                                autoFocus={true}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                            "Enter" &&
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
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        block
                                        size="md"
                                        color="secondary"
                                        outline
                                        onClick={this.props.onCloseModal}
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
    { openRoom: roomOpenRequestedAction },
)(RoomCreateModal);
