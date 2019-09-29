import { Component } from "react";
import React from "react";
import { Modal, Button, ModalBody } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { QueueParticipantDto } from "../../../api/types";

interface QuestionQueueAcceptModalProps {
    isOpen: boolean;
    onCloseModal: () => void;
    participant: QueueParticipantDto | null;
    remind: () => void;
}

/**
 * A modal that allows the Teaching Assistant to remind the student
 * more easily.
 */
export default class QuestionQueueAcceptModal extends Component<
    QuestionQueueAcceptModalProps
> {
    render() {
        const { participant, onCloseModal, remind } = this.props;
        if (participant != null) {
            return (
                <Modal
                    autoFocus={false}
                    isOpen={this.props.isOpen}
                    onClosed={() => onCloseModal()}
                >
                    <ModalBody className="py-5 px-md-5">
                        <h4 className="text-center">
                            Currently helping <br />
                        </h4>
                        <h2 className="text-primary text-center mb-4">
                            {participant!.fullName}
                        </h2>
                        <Button
                            className="py-3"
                            title={`Send a reminder`}
                            outline
                            size="lg"
                            block
                            color="primary"
                            onClick={() => remind()}
                        >
                            <FontAwesomeIcon
                                icon={faBell}
                                size="4x"
                                className="mb-2"
                            />
                            <br />
                            {`Send a reminder`}
                        </Button>
                        <Button
                            className="mt-3"
                            title="Go back to the room"
                            outline
                            size="lg"
                            block
                            color="success"
                            onClick={() => onCloseModal()}
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                size="lg"
                                className="mr-3"
                            />
                            Go back to the room
                        </Button>
                    </ModalBody>
                </Modal>
            );
        } else {
            return null;
        }
    }
}
