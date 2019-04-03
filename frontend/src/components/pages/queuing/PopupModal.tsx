import React, { PureComponent } from "react";
import { Button, ModalHeader, Modal, ModalBody, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faBell } from "@fortawesome/free-solid-svg-icons";
import { RemindDto, AnnouncementDto } from "../../../api/types";

interface PopupModalProps {
    onCloseModal: () => any;
    timer?: number;
    isOpen: boolean;
    announcement?: AnnouncementDto;
    reminder?: RemindDto;
    closeable?: boolean;
}

export default class PopupModal extends PureComponent<PopupModalProps> {
    static defaultProps: { closeable: false };

    timer = -1;

    componentDidMount() {
        if (this.props.timer != null) {
            this.timer = setTimeout(() => {
                this.props.onCloseModal();
            }, this.props.timer);
        }
    }

    componentDidUpdate(prProps: PopupModalProps) {
        if (prProps.reminder !== this.props.reminder) {
            if (this.props.timer != null) {
                this.timer = setTimeout(() => {
                    this.props.onCloseModal();
                }, this.props.timer);
            }
        }
    }

    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
    }

    render() {
        const {
            isOpen,
            onCloseModal,
            announcement,
            reminder,
            closeable,
        } = this.props;
        let title;
        let bodyText;
        let icon;

        if (reminder != null) {
            title = reminder.participant.fullName + ", you are next!";
            bodyText = "Raise your hand to get the TA's attention.";
            icon = faBell;
        } else if (announcement != null) {
            title = "New announcement";
            bodyText = announcement.content;
            icon = faBullhorn;
        } else {
            title = "You are next!";
            bodyText = "Raise your hand to get the TA's attention.";
            icon = faBell;
        }

        return (
            <Modal isOpen={isOpen}>
                <ModalHeader
                    toggle={closeable ? () => onCloseModal() : undefined}
                >
                    <FontAwesomeIcon icon={icon} className="mr-3" />
                    {title}
                </ModalHeader>
                <ModalBody>{bodyText}</ModalBody>
                {closeable && (
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
                )}
            </Modal>
        );
    }
}
