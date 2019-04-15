import React, { PureComponent, Fragment } from "react";
import { Button, ModalHeader, Modal, ModalBody, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faBell } from "@fortawesome/free-solid-svg-icons";
import { RemindDto, AnnouncementDto } from "../../../api/types";

interface PopupModalProps {
    onCloseModal: () => any;
    timer?: number;
    announcement?: AnnouncementDto;
    reminder?: RemindDto;
    closeable?: boolean;
}

interface PopupModalState {
    switching: boolean;
    reminder: RemindDto | null;
}

/**
 * A modal that is used for a variety of purposes.
 * The main purpose is to notify students (on their own device)
 * that it is their turn to and to let them know they should raise
 * their hands.
 *
 * Another important usage of this modal is for the beamer view. When
 * a student is accepted (or notified again), this modal pops ups for
 * as long as the given 'timer' (in ms) specifies. When multiple
 * students are accepted simultaneously, the modals are queued.
 *
 * Finally, this modal can also be used for displaying queue notifications
 * to students on their own device.
 */
export default class PopupModal extends PureComponent<
    PopupModalProps,
    PopupModalState
> {
    static defaultProps: { closeable: false };
    timer: number;

    constructor(props: PopupModalProps) {
        super(props);
        this.state = { switching: false, reminder: null };
        this.timer = -1;
    }

    closeModalTimeout() {
        // Set a time out to close the modal
        if (this.props.timer != null) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.props.onCloseModal();
            }, this.props.timer);
        }
    }

    switchModal(currRem: RemindDto) {
        this.setState(
            () => ({ switching: true }),
            () => {
                setTimeout(() => {
                    this.setState(
                        () => ({
                            switching: false,
                            reminder: currRem,
                        }),
                        () => {
                            this.closeModalTimeout();
                        },
                    );
                }, 250);
            },
        );
    }

    componentDidUpdate(prProps: PopupModalProps) {
        if (this.props.timer != null) {
            const currRem = this.props.reminder;
            const prevRem = prProps.reminder;

            if (prevRem == null && currRem != null) {
                this.setState(
                    () => ({ reminder: currRem }),
                    () => {
                        this.closeModalTimeout();
                    },
                );
            } else if (prevRem != null && currRem == null) {
                this.setState(() => ({ reminder: null }));
                return;
            } else if (currRem !== prevRem && currRem != null) {
                this.switchModal(currRem);
            }
        }
    }

    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
    }

    render() {
        const { onCloseModal, announcement, closeable } = this.props;

        const reminder =
            this.state.reminder != null
                ? this.state.reminder
                : this.props.reminder;

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
            <Fragment>
                <Modal isOpen={announcement != null}>
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
                <Modal isOpen={reminder != null && !this.state.switching}>
                    <ModalBody className="py-5">
                        <div className="d-flex justify-content-center h-100 flex-wrap">
                            <div className="my-auto w-100 text-center">
                                <h1>
                                    <FontAwesomeIcon
                                        icon={icon}
                                        size="3x"
                                        className="mb-5"
                                    />{" "}
                                </h1>
                                <h1 className="text-muted">
                                    {reminder != null &&
                                        reminder.participant.fullName}
                                    ,
                                </h1>
                                <h3 className="text-muted">You are next!</h3>
                            </div>
                        </div>
                    </ModalBody>
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
            </Fragment>
        );
    }
}
