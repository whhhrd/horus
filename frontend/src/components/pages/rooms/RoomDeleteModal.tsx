import { Component } from "react";
import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";
import { RoomDto } from "../../../api/types";
import {
    RoomCloseRequestedAction,
    roomCloseRequestedAction,
} from "../../../state/rooms/action";
import { ApplicationState } from "../../../state/state";

interface RoomDeleteModalProps {
    isOpen: boolean;
    courseId: number;
    room: RoomDto;

    closeRoom: (courseId: number, roomCode: string) => RoomCloseRequestedAction;

    onCloseModal: () => void;
}

class RoomDeleteModal extends Component<RoomDeleteModalProps> {
    constructor(props: RoomDeleteModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    closeRoom() {
        const { courseId, room, closeRoom } = this.props;
        closeRoom(courseId, room.code);
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={this.onCloseModal}>
                    Closing room{" "}
                    <span className="font-weight-bold">
                        {this.props.room.name}
                    </span>
                </ModalHeader>
                {this.props.isOpen && (
                    <div>
                        <ModalBody>
                            Are you sure you want to close the room?
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
                                onClick={() => this.closeRoom()}
                            >
                                Close the room
                            </Button>
                        </ModalFooter>
                    </div>
                )}
            </Modal>
        );
    }
}

export default connect(
    (_: ApplicationState) => ({}),
    { closeRoom: roomCloseRequestedAction },
)(RoomDeleteModal);
