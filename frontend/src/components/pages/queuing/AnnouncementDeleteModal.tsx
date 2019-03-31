import { Component } from "react";
import React from "react";
import { ModalHeader, ModalBody, ModalFooter, Modal, Button } from "reactstrap";
import { AnnouncementDto } from "../../../api/types";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import {
    AnnouncementRemovedAction,
    announcementRemovedAction,
} from "../../../state/queuing/actions";

interface AnnouncementDeleteModalProps {
    isOpen: boolean;
    onCloseModal: () => void;
    announcement: AnnouncementDto;
    deleteAnnouncement: (
        rid: string,
        cid: number,
        id: string,
    ) => AnnouncementRemovedAction;
}

class AnnouncementDeleteModal extends Component<
    AnnouncementDeleteModalProps & RouteComponentProps<any>
> {
    render() {
        return (
            <Modal isOpen={this.props.isOpen != null}>
                <ModalHeader toggle={() => this.props.onCloseModal()}>
                    Deleting announcement
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this announcement?
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        outline
                        color="secondary"
                        onClick={() => this.props.onCloseModal()}
                    >
                        Cancel
                    </Button>
                    <Button
                        block
                        color="primary"
                        onClick={() => this.deleteAnnouncement()}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    deleteAnnouncement() {
        this.props.deleteAnnouncement(
            this.props.match.params.rid,
            Number(this.props.match.params.cid),
            this.props.announcement.id,
        );
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }
}

export default withRouter(
    connect(
        () => ({}),
        {
            deleteAnnouncement: (rid: string, cid: number, id: string) =>
                announcementRemovedAction(cid, rid, id),
        },
    )(AnnouncementDeleteModal),
);
