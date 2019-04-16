import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Col, Button, Card, CardBody, CardTitle } from "reactstrap";

import { ApplicationState } from "../../../state/state";
import { RoomDto, ParticipantDtoBrief } from "../../../api/types";
import {
    RoomsFetchRequestedAction,
    roomsFetchRequestedAction,
    roomOpenRequestedAction,
} from "../../../state/rooms/action";
import { getRooms } from "../../../state/rooms/selectors";

import { buildContent } from "../../pagebuilder";
import RoomCreateModal from "./RoomCreateModal";
import RoomDeleteModal from "./RoomDeleteModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { CurrentParticipantRequestedAction, currentParticipantRequestedAction } from "../../../state/courses/action";
import { getCurrentParticipant } from "../../../state/courses/selectors";

interface RoomsProps {
    rooms: RoomDto[] | null;
    currentParticipant: ParticipantDtoBrief | null;

    fetchRooms: (courseId: number) => RoomsFetchRequestedAction;
    fetchCurrentParticipant: (
        courseId: number,
    ) => CurrentParticipantRequestedAction;
}

interface RoomsState {
    roomCreateModalOpen: boolean;

    roomCloseModalOpen: boolean;
    roomToClose: RoomDto | null;
}

/**
 * A page that displays the open rooms within a course.
 * Permitted users can create or close rooms. All users
 * can join the room.
 *
 * Rooms are refreshed every POLL_INTERVAL seconds.
 */
class Rooms extends Component<
    RoomsProps & RouteComponentProps<any>,
    RoomsState
> {
    static POLL_INTERVAL = 15000;
    poller: number;

    constructor(props: RoomsProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            roomCreateModalOpen: false,
            roomCloseModalOpen: false,
            roomToClose: null,
        };
        this.poller = -1;
        this.toggleRoomCreateModal = this.toggleRoomCreateModal.bind(this);
        this.toggleRoomCloseModal = this.toggleRoomCloseModal.bind(this);
    }

    toggleRoomCreateModal() {
        this.setState((state) => ({
            roomCreateModalOpen: !state.roomCreateModalOpen,
        }));
    }

    toggleRoomCloseModal(room: RoomDto | null) {
        this.setState((state) => ({
            roomToClose: room,
            roomCloseModalOpen: !state.roomCloseModalOpen,
        }));
    }

    /**
     * Fetches the rooms and starts polling again
     * when the timer runs out.
     */
    poll() {
        this.poller = setTimeout(() => {
            if (document.hasFocus()) {
                this.props.fetchRooms(this.props.match.params.cid);
            }
            this.poll();
        }, Rooms.POLL_INTERVAL);
    }

    componentDidMount() {
        const courseId = this.props.match.params.cid;
        this.props.fetchRooms(courseId);
        this.props.fetchCurrentParticipant(courseId);
        this.poll();
    }

    componentWillUnmount() {
        clearTimeout(this.poller);
    }

    render() {
        return buildContent("Rooms", this.buildContent(), null);
    }

    buildContent() {
        const { rooms, currentParticipant } = this.props;

        if (rooms == null || currentParticipant == null) {
            return null;
        }

        return (
            <Row className="px-2 d-flex justify-content-center">
                <Col xs="12" md="9" lg="7" xl="5">
                    <h4>
                        Open rooms:
                        {currentParticipant.role.name !== "STUDENT" && (
                            <Button
                                title="Open a room"
                                className="float-right"
                                size="sm"
                                color="success"
                                onClick={this.toggleRoomCreateModal}
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    size="sm"
                                    className="mr-2"
                                />
                                Open a room
                            </Button>
                        )}
                    </h4>
                    <div className="mb-3 pt-2">
                        {rooms.length > 0 &&
                            rooms.map((r) => (
                                <Card className="mb-3" key={r.code}>
                                    <CardBody className="py-2">
                                        <CardTitle
                                            className="my-auto d-flex align-items-center
                                                justify-content-between"
                                        >
                                            <div className="flex-grow-1 flex-wrap">
                                                <div>
                                                    <span>{r.name} </span>
                                                </div>
                                                <div>
                                                    <small className="text-muted">
                                                        Room code: {r.code}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <Button
                                                    outline
                                                    color="primary"
                                                    title="Go to room"
                                                    onClick={() =>
                                                        this.goToRoom(r.code)
                                                    }
                                                >
                                                    Join
                                                </Button>
                                                {currentParticipant.role
                                                    .name !== "STUDENT" && (
                                                    <Button
                                                        outline
                                                        color="danger"
                                                        className="ml-2"
                                                        title="Close room"
                                                        onClick={() =>
                                                            this.toggleRoomCloseModal(
                                                                r,
                                                            )
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTimes}
                                                        />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardTitle>
                                    </CardBody>
                                </Card>
                            ))}
                        {rooms.length === 0 && (
                            <span className="text-muted">
                                There are no open rooms yet.
                            </span>
                        )}
                    </div>
                </Col>
                {this.state.roomCreateModalOpen && (
                    <RoomCreateModal
                        isOpen={this.state.roomCreateModalOpen}
                        courseId={this.props.match.params.cid}
                        onCloseModal={this.toggleRoomCreateModal}
                    />
                )}
                {this.state.roomCloseModalOpen &&
                    this.state.roomToClose != null && (
                        <RoomDeleteModal
                            isOpen={this.state.roomCloseModalOpen}
                            room={this.state.roomToClose}
                            courseId={this.props.match.params.cid}
                            onCloseModal={() => this.toggleRoomCloseModal(null)}
                        />
                    )}
            </Row>
        );
    }

    /**
     * Redirects the user to the room with the given room code.
     * @param roomCode The room code of the 'joined' room.
     */
    goToRoom(roomCode: string) {
        this.props.history.push({
            ...this.props.history.location,
            pathname: this.props.location.pathname + `/${roomCode}`,
        });
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            rooms: getRooms(state),
            currentParticipant: getCurrentParticipant(state),
        }),
        {
            fetchRooms: roomsFetchRequestedAction,
            fetchCurrentParticipant: currentParticipantRequestedAction,
            openRoom: roomOpenRequestedAction,
        },
    )(Rooms),
);
