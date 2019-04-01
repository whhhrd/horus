import React, { Component } from "react";
import { ConnectionState } from "../../../state/queuing/types";
import Queue from "./Queue";
import {
    RoomDto,
    AnnouncementDto,
    AcceptDto,
    QueueDto,
    ParticipantDto,
    UpdateDto,
} from "../../../api/types";
import {
    updateReceivedAction,
    UpdateReceivedAction,
} from "../../../state/queuing/actions";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import {
    getAnnouncements,
    getHistory,
    getQueues,
    getRoom,
} from "../../../state/queuing/selectors";
import { ApplicationState } from "../../../state/state";
import {
    buildConnectingSpinner,
    buildBigCenterMessage,
} from "../../pagebuilder";
import { Alert, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBullhorn,
    faDoorClosed,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface ProjectorQueuingPageProps {
    newAnnouncement: AnnouncementDto | null;
    announcements: AnnouncementDto[] | null;
    queueHistory: AcceptDto[] | null;
    queues: QueueDto[] | null;
    room: RoomDto | null;
    updateReceived: (update: UpdateDto) => UpdateReceivedAction;
}

interface ProjectorQueuingPageState {
    connectionState: ConnectionState;
}

class ProjectorQueuingPage extends Component<
    ProjectorQueuingPageProps & RouteComponentProps<any>,
    ProjectorQueuingPageState
> {
    private sock: WebSocket | null = null;
    constructor(props: ProjectorQueuingPageProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            connectionState: ConnectionState.Connecting,
        };
        this.onSockClose = this.onSockClose.bind(this);
        this.onSockError = this.onSockError.bind(this);
        this.onSockMessage = this.onSockMessage.bind(this);
        this.onSockOpen = this.onSockOpen.bind(this);
    }

    render() {
        if (this.props.room != null) {
            return (
                // A flexible body for the navigation bar, content (including sidebar)
                <div className="d-none d-lg-flex">
                    {/* Fills the remaining horizontal space (next to the navbar) */}
                    <div className="flex-fill">
                        {/* A wrapper for the content, a flexible row that contains
                            the content ans possibly the sidebar */}
                        <div className="ContentWrapper d-flex flex-row">
                            {/* The body for the actual content, a flex column that contanis
                                the title and body content */}
                            <div className="ContentBody d-flex flex-column flex-fill">
                                {/* The content header box displaying the 'headerTitle' argument */}
                                <div className="ContentHeader px-3 pt-3 w-100">
                                    <h2>{"Room: " + this.props.room.name}</h2>
                                    <hr className="mb-0" />
                                </div>

                                {/* The main content box, displaying the elements from the 'content' argument or
                            the center spinner if the content is Null. */}
                                <div className="ContentMain px-3 pt-3 pb-3 w-100">
                                    {this.buildContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return buildConnectingSpinner("Connecting to room...");
        }
    }

    componentDidMount() {
        // Start listening to the websocket for changes to the queuing state
        this.connect();
    }

    // componentDidUpdate(
    //     prevprops: QueuingPageProps & RouteComponentProps<any>,
    //     _: QueuingPageState,
    // ) {

    //     // Automatically remove popup after a few seconds on projector
    //     if (
    //         this.state.mode === QueuingMode.Projector &&
    //         this.props.reminder != null
    //     ) {
    //         if (this.currentPopup != null) {
    //             clearTimeout(this.currentPopup);
    //         }
    //         this.currentPopup = setTimeout(() => {
    //             this.props.resetReminder();
    //         }, PROJECTOR_POPUP_TIMEOUT);
    //     }

    //     if (
    //         this.state.mode === QueuingMode.Projector &&
    //         this.props.newAnnouncement != null
    //     ) {
    //         if (this.currentPopup != null) {
    //             clearTimeout(this.currentPopup);
    //         }
    //         this.currentPopup = setTimeout(() => {
    //             this.props.resetNewAnnouncement();
    //         }, PROJECTOR_POPUP_TIMEOUT);
    //     }
    // }

    componentWillUnmount() {
        if (this.sock != null) {
            this.sock.close();
            this.sock.removeEventListener("open", this.onSockOpen);
            this.sock.removeEventListener("close", this.onSockClose);
            this.sock.removeEventListener("message", this.onSockMessage);
            this.sock.removeEventListener("error", this.onSockError);
        }
    }

    // TODO proper error handling and recovering connection
    private connect() {
        // TODO remove this crap when not needed anymore
        const host = `ws${location.protocol === "https:" ? "s" : ""}://${
            location.hostname
        }:${
            location.port === "8081" ? "8080" : location.port
        }/ws/queuing/rooms/${this.props.match.params.rid}/feed`;
        if (this.sock != null) {
            this.sock.close();
            this.sock.removeEventListener("open", this.onSockOpen);
            this.sock.removeEventListener("close", this.onSockClose);
            this.sock.removeEventListener("message", this.onSockMessage);
            this.sock.removeEventListener("error", this.onSockError);
        }
        this.sock = new WebSocket(host);
        this.sock.addEventListener("open", this.onSockOpen);
        this.sock.addEventListener("close", this.onSockClose);
        this.sock.addEventListener("message", this.onSockMessage);
        this.sock.addEventListener("error", this.onSockError);
    }

    private onSockOpen() {
        this.setState({ connectionState: ConnectionState.Connected });
    }

    private onSockClose(event: CloseEvent) {
        if (event.code === 1007 || event.code === 1000) {
            this.setState({
                connectionState: ConnectionState.Closed,
            });
        } else {
            this.setState({ connectionState: ConnectionState.Reconnecting });
            setTimeout(() => this.connect(), 2000);
        }
    }

    private onSockMessage(event: MessageEvent) {
        this.props.updateReceived(JSON.parse(event.data));
    }

    private onSockError() {
        this.setState({ connectionState: ConnectionState.Reconnecting });
    }

    private buildContent() {
        if (
            this.state.connectionState === ConnectionState.Connecting ||
            (this.state.connectionState === ConnectionState.Connected &&
                this.props.queues == null)
        ) {
            return buildConnectingSpinner("Connecting...");
        }

        if (this.state.connectionState === ConnectionState.Reconnecting) {
            return buildConnectingSpinner("Reconnecting...");
        }

        if (this.state.connectionState === ConnectionState.Closed) {
            return buildBigCenterMessage("Room is closed", faDoorClosed);
        } else if (
            this.state.connectionState === ConnectionState.Connected &&
            this.props.queues != null
        ) {
            return (
                <div>
                    {this.buildAnnouncements()}
                    {this.buildQueues()}
                </div>
            );
        } else {
            return buildBigCenterMessage("Unknown error occurred", faTimes);
        }
    }

    private buildAnnouncements() {
        const { announcements } = this.props;

        if (announcements != null) {
            return announcements.map((a, i) => (
                <Alert
                    color="primary"
                    className={`${
                        i === announcements.length - 1 ? "mb-3" : "mb-2"
                    }`}
                    key={a.id}
                >
                    <FontAwesomeIcon icon={faBullhorn} className="mr-3" />
                    {a.content}
                </Alert>
            ));
        } else {
            return null;
        }
    }

    private buildQueues() {
        return (
            <Row className="row-eq-height">
                {this.props.queues!.map((queue: QueueDto) => (
                    <Queue
                        key={queue.id}
                        title={queue.name}
                        entries={queue.participants.map(
                            (participant: ParticipantDto) => ({
                                name: participant.fullName,
                                participantId: participant.id,
                            }),
                        )}
                        mode={undefined}
                    />
                ))}
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            announcements: getAnnouncements(state),
            queueHistory: getHistory(state),
            queues: getQueues(state),
            room: getRoom(state),
        }),
        {
            updateReceived: (update: UpdateDto) => updateReceivedAction(update),
        },
    )(ProjectorQueuingPage),
);
