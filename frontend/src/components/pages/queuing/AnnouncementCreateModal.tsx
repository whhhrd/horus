import { Component, KeyboardEvent } from "react";
import React from "react";
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

interface AnnouncementCreateModalProps {
    isOpen: boolean;
    onCloseModal: () => void;
    onCreate: (announcement: string) => any;
}

interface AnnouncementValues {
    announcement: string;
}

/**
 * A modal that allows the user to create an announcement.
 */
export default class AnnouncementCreateModal extends Component<
    AnnouncementCreateModalProps
> {
    isValid(announcement: string) {
        return announcement.trim().length > 0;
    }

    render() {
        return (
            <Modal autoFocus={false} isOpen={this.props.isOpen}>
                <ModalHeader toggle={() => this.props.onCloseModal()}>
                    Creating an announcement for this room
                </ModalHeader>

                <Formik
                    initialValues={{ announcement: "" }}
                    onSubmit={(result: AnnouncementValues) => {
                        this.props.onCreate(result.announcement);
                        this.props.onCloseModal();
                    }}
                >
                    {({ handleSubmit, values }) => (
                        <div>
                            <ModalBody>
                                <FormGroup>
                                    <Label>Announcement</Label>
                                    <Input
                                        autoComplete={"off"}
                                        tag={Field}
                                        autoFocus={true}
                                        id="announcement"
                                        name="announcement"
                                        valid={this.isValid(
                                            values.announcement,
                                        )}
                                        invalid={
                                            !this.isValid(values.announcement)
                                        }
                                        onKeyDown={(event: KeyboardEvent) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();
                                                if (this.isValid(values.announcement)) {
                                                    handleSubmit();
                                                }
                                            }
                                        }}
                                    />
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    outline
                                    block
                                    color="secondary"
                                    onClick={() => this.props.onCloseModal()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    block
                                    disabled={!this.isValid(values.announcement)}
                                    color="primary"
                                    onClick={() => handleSubmit()}
                                >
                                    Create
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }
}
