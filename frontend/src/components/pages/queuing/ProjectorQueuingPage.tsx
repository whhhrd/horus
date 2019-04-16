import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Alert, Row } from "reactstrap";

import { ConnectionState } from "../../../state/queuing/types";
import {
    RoomDto,
    AnnouncementDto,
    AcceptDto,
    QueueDto,
    UpdateDto,
    QueueParticipantDto,
    UpdateType,
    RemindDto,
} from "../../../api/types";
import {
    updateReceivedAction,
    UpdateReceivedAction,
} from "../../../state/queuing/actions";
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
    setPageTitle,
} from "../../pagebuilder";
import PopupModal from "./PopupModal";
import History from "./History";
import Queue from "./Queue";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBullhorn,
    faDoorClosed,
    faSadCry,
} from "@fortawesome/free-solid-svg-icons";
import { QueuingSocket } from "./QueuingSocket";

interface ProjectorQueuingPageProps {
    newAnnouncement: AnnouncementDto | null;
    announcements: AnnouncementDto[] | null;
    queues: QueueDto[] | null;
    room: RoomDto | null;
    updateReceived: (update: UpdateDto) => UpdateReceivedAction;
}

interface ProjectorQueuingPageState {
    connectionState: ConnectionState;
    reminders: RemindDto[];
}

/**
 * This component is used to display the queues and history on
 * a beamer view. This page can be accessed by specifying the
 * room code in the URL or by submitting the room code in the
 * beamer prompt page ProjectorRoomPromptPage. When students
 * are accepted on any queue, a PopupModal will be generated
 * which will be visible for NOTIFICATION_DURATION milliseconds.
 */
class ProjectorQueuingPage extends Component<
    ProjectorQueuingPageProps & RouteComponentProps<any>,
    ProjectorQueuingPageState
> {
    static NOTIFICATION_DURATION = 5000;

    private queuingSocket: QueuingSocket | null = null;

    constructor(props: ProjectorQueuingPageProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            connectionState: ConnectionState.Connecting,
            reminders: [],
        };
    }

    render() {
        const { room } = this.props;
        const { connectionState } = this.state;

        if (room != null) {
            setPageTitle("Room: " + room.name + `(${room.code})`);
            return (
                <div style={{ height: "100vh" }}>
                    <div className="d-none d-lg-flex">
                        {/* Fills the remaining horizontal space*/}
                        <div className="flex-fill">
                            {/* A wrapper for the content, a flexible row that contains
                            the content ans possibly the sidebar */}
                            <div className="ContentWrapper d-flex flex-row">
                                {/* The body for the actual content, a flex column that contanis
                                the title and body content */}
                                <div className="ContentBody d-flex flex-column flex-fill">
                                    {/* The content header box displaying the 'headerTitle' argument */}
                                    <div className="ContentHeader px-3 pt-3 w-100">
                                        <h2>{"Room: " + room.name}</h2>
                                        <hr className="mb-0" />
                                    </div>

                                    {/* The main content box, displaying the elements from the 'content' argument or
                                        the center spinner if the content is Null. */}
                                    <div className="ContentMain px-3 pt-3 pb-3 w-100">
                                        {this.buildAnnouncements()}
                                        {this.buildQueues()}
                                        {this.buildPopup()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-lg-none h-100">
                        {buildBigCenterMessage(
                            "Screen size not suitable for beamer mode.",
                            faSadCry,
                        )}
                    </div>
                </div>
            );
        } else if (connectionState === ConnectionState.NotFound) {
            setPageTitle("");
            return (
                <div style={{ height: "100vh" }}>
                    {buildBigCenterMessage("Oops! Room not found.", faSadCry)}
                </div>
            );
        } else if (this.state.connectionState === ConnectionState.Closed) {
            setPageTitle("");
            return (
                <div style={{ height: "100vh" }}>
                    {buildBigCenterMessage("Rooms is closed.", faDoorClosed)}
                </div>
            );
        } else {
            setPageTitle("");
            return (
                <div style={{ height: "100vh" }}>
                    {buildConnectingSpinner("Connecting to room...")}
                </div>
            );
        }
    }

    componentWillMount() {
        this.queuingSocket = new QueuingSocket(
            this.props.match.params.rid,
            this.onSockOpen,
            this.onSockClose,
            this.onSockMessage,
            this.onSockError,
            this,
        );
    }

    componentWillUnmount() {
        if (this.queuingSocket != null) {
            this.queuingSocket.shutdown();
        }
    }

    private onSockOpen() {
        this.setState({ connectionState: ConnectionState.Connected });
    }

    private onSockClose(event: CloseEvent) {
        if (event.code === 1007) {
            this.setState({
                connectionState: ConnectionState.NotFound,
            });
        } else if (event.code === 1000) {
            this.setState({
                connectionState: ConnectionState.Closed,
            });
        } else {
            this.setState({ connectionState: ConnectionState.Reconnecting });
            setTimeout(
                () =>
                    (this.queuingSocket = new QueuingSocket(
                        this.props.match.params.rid,
                        this.onSockOpen,
                        this.onSockClose,
                        this.onSockMessage,
                        this.onSockError,
                        this,
                    )),
                2000,
            );
        }
    }

    private onSockMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        const type: UpdateType = data.type;

        switch (type) {
            case "ACCEPT": {
                const reminder: RemindDto = {
                    participant: (data as AcceptDto).participant,
                    roomCode: (data as AcceptDto).roomCode,
                    type,
                };
                this.addReminderToQueue(reminder);
                break;
            }
            case "REMIND": {
                const reminder: RemindDto = data as RemindDto;
                this.addReminderToQueue(reminder);
                break;
            }
            default:
                break;
        }
        this.props.updateReceived(data);
    }

    private onSockError() {
        this.setState({ connectionState: ConnectionState.Reconnecting });
    }

    /**
     * Generates a PopupModal with the first reminder in the
     * queue. Sets the timer field for the reminder, which causes
     * the PopupModal to expire after the specified duration, clearing
     * the first element in the queue and displaying the next (if exists).
     */
    private buildPopup() {
        const nextReminder = this.state.reminders[0];
        return (
            <PopupModal
                onCloseModal={() => this.removeReminderFromQueue()}
                timer={ProjectorQueuingPage.NOTIFICATION_DURATION}
                reminder={nextReminder}
            />
        );
    }

    /**
     * Builds the Alerts that display the current
     * announcements visible in the room.
     */
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

    /**
     * Builds the queues and the history.
     */
    private buildQueues() {
        return (
            <Row className="row-eq-height">
                {this.props.queues!.map((queue: QueueDto) => (
                    <Queue
                        key={queue.id}
                        queue={queue}
                        entries={queue.participants.map(
                            (participant: QueueParticipantDto) => ({
                                participant,
                            }),
                        )}
                        mode={undefined}
                    />
                ))}
                <History />
            </Row>
        );
    }

    /**
     * Adds a reminder to the queue, which the PopupModal will
     * eventually display.
     * @param reminder The reminder to be added to the queue.
     */
    private addReminderToQueue(reminder: RemindDto) {
        this.setState((state) => {
            const existingReminder = state.reminders.find(
                (r) => r.participant.id === reminder.participant.id,
            );

            if (existingReminder == null) {
                const newReminders = this.state.reminders.slice();
                newReminders.push(reminder);
                return { reminders: newReminders };
            } else {
                return { reminders: state.reminders };
            }
        });
    }

    /**
     * Removes the first reminder from the queue,
     * most likely because it has been displayed and
     * dismissed by the PopupModal onCloseModal callback.
     */
    private removeReminderFromQueue() {
        this.setState((state) => {
            const newReminders = state.reminders.slice();
            newReminders.shift();
            return { reminders: newReminders };
        });
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
