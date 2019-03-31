import React, { PureComponent } from "react";
import { Button, ModalHeader, Modal, ModalBody, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faBell } from "@fortawesome/free-solid-svg-icons";

interface PopupProps {
    isOpen: boolean;
    onCloseModal: () => any;

    announcement?: string;
}

export default class PopupModal extends PureComponent<PopupProps> {
    render() {
        const { isOpen, onCloseModal, announcement } = this.props;
        return (
            <Modal isOpen={isOpen}>
                <ModalHeader toggle={() => onCloseModal()}>
                    <FontAwesomeIcon icon={announcement != null ? faBullhorn : faBell} className="mr-3"/>
                    {announcement != null
                        ? "New announcement"
                        : "You are next!"}
                </ModalHeader>
                <ModalBody>
                    {announcement != null
                        ? announcement
                        : "It is your turn. Raise your hand to get the TA's attention."}
                </ModalBody>
                <ModalFooter>
                    <Button
                        outline
                        color="primary"
                        block
                        onClick={() => onCloseModal()}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
