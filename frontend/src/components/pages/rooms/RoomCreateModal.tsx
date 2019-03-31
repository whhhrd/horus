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

class RoomCreateModal extends Component<RoomCreateModalProps> {
    constructor(props: RoomCreateModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onSubmit = (roomCreate: RoomCreateDto) => {
        this.props.openRoom(this.props.courseId, roomCreate);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    isValid(roomCreate: RoomCreateDto) {
        return roomCreate.name.trim().length > 0;
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
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
    { openRoom: roomOpenRequestedAction },
)(RoomCreateModal);
