import React, { Component, Fragment } from "react";
import {
    QueuingMode,
    AcceptedParticipant,
    ConnectionState,
} from "../../../state/queuing/types";
import Queue from "./Queue";
import {
    RoomDto,
    AnnouncementDto,
    AcceptDto,
    QueueDto,
    UpdateDto,
    ParticipantDtoBrief,
    AssignmentSetDtoBrief,
    QueueParticipantDto,
    RemindDto,
    UpdateType,
    AddAnnouncementDto,
} from "../../../api/types";
import {
    announcementCreatedAction,
    announcementRemovedAction,
    AnnouncementCreatedAction,
    AnnouncementRemovedAction,
    acceptRequestedAction,
    AcceptRequestedAction,
    updateReceivedAction,
    UpdateReceivedAction,
    currentParticipantRequestedAction,
    CurrentParticipantRequestedAction,
    queueCreatedAction,
    QueueCreatedAction,
    dequeueRequestedAction,
    DequeueRequestedAction,
    enterQueueAction,
    EnterQueueAction,
    queueRemovedAction,
    QueueRemovedAction,
    acceptNextAction,
    AcceptNextAction,
} from "../../../state/queuing/actions";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import {
    getAnnouncements,
    getQueues,
    getCurrentParticipant,
} from "../../../state/queuing/selectors";
import { ApplicationState } from "../../../state/state";
import { registration } from "../../..";
import { API_STUDENT_ROLE } from "../../../state/courses/constants";
import {
    assignmentSetsFetchRequestedAction,
    AssignmentSetsFetchAction,
} from "../../../state/assignments/actions";
import { getAssignmentSets } from "../../../state/assignments/selectors";
import PopupModal from "./PopupModal";
import {
    buildContent,
    buildBigCenterMessage,
    buildConnectingSpinner,
    setPageTitle,
} from "../../pagebuilder";
import { getRoom } from "../../../state/rooms/selectors";
import {
    RoomsFetchRequestedAction,
    roomsFetchRequestedAction,
} from "../../../state/rooms/action";
import { Row, Button, Alert } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDoorClosed,
    faTimes,
    faPlus,
    faSadCry,
    faBullhorn,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import QueueCreateModal from "./QueueCreateModal";
import AnnouncementCreateModal from "./AnnouncementCreateModal";
import AnnouncementDeleteModal from "./AnnouncementDeleteModal";
import QueueDeleteModal from "./QueueDeleteModal";
import History from "./History";
import Busyness from "./Busyness";

interface QueuingPageProps {
    announcements: AnnouncementDto[] | null;
    queues: QueueDto[] | null;
    room: (roomCode: string) => RoomDto | null;
    participant: ParticipantDtoBrief | null;
    assignmentSets: AssignmentSetDtoBrief[] | null;
    fetchRooms: (courseId: number) => RoomsFetchRequestedAction;
    createAnnouncement: (
        rid: string,
        cid: number,
        announcement: string,
    ) => AnnouncementCreatedAction;
    deleteAnnouncement: (
        rid: string,
        cid: number,
        id: string,
    ) => AnnouncementRemovedAction;
    acceptParticipant: (
        cid: number,
        rid: string,
        qid: string,
        pid: number,
    ) => AcceptRequestedAction;
    dequeueParticipant: (
        cid: number,
        rid: string,
        qid: string,
        pid: number,
    ) => DequeueRequestedAction;
    updateReceived: (update: UpdateDto) => UpdateReceivedAction;
    requestCurrentParticipant: (
        cid: number,
    ) => CurrentParticipantRequestedAction;
    requestAssignmentSets: (cid: number) => AssignmentSetsFetchAction;
    createQueue: (
        name: string,
        asid: number | null,
        cid: number,
        rid: string,
    ) => QueueCreatedAction;
    enqueue: (cid: number, rid: string, qid: string) => EnterQueueAction;
    deleteQueue: (cid: number, rid: string, qid: string) => QueueRemovedAction;
    acceptNext: (cid: number, rid: string, qid: string) => AcceptNextAction;
}

interface QueuingPageState {
    mode: QueuingMode | null;
    connectionState: ConnectionState;

    queueCreateModalOpen: boolean;
    queueToDelete: QueueDto | null;

    announcementCreateModalOpen: boolean;
    announcementToDelete: AnnouncementDto | null;

    newAnnouncement: AnnouncementDto | null;
    reminder: RemindDto | null;
}
class QueuingPage extends Component<
    QueuingPageProps & RouteComponentProps<any>,
    QueuingPageState
> {
    private acceptedParticipant: AcceptedParticipant | null = null;
    private sock: WebSocket | null = null;
    constructor(props: QueuingPageProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            mode: QueuingMode.Student,
            connectionState: ConnectionState.Connecting,
            announcementCreateModalOpen: false,
            announcementToDelete: null,
            queueCreateModalOpen: false,
            queueToDelete: null,
            newAnnouncement: null,
            reminder: null,
        };
        this.onSockClose = this.onSockClose.bind(this);
        this.onSockError = this.onSockError.bind(this);
        this.onSockMessage = this.onSockMessage.bind(this);
        this.onSockOpen = this.onSockOpen.bind(this);
        this.toggleAnnouncementCreateModal = this.toggleAnnouncementCreateModal.bind(
            this,
        );
        this.toggleAnnouncementDeleteModal = this.toggleAnnouncementDeleteModal.bind(
            this,
        );
        this.toggleQueueCreateModal = this.toggleQueueCreateModal.bind(this);
        this.toggleQueueDeleteModal = this.toggleQueueDeleteModal.bind(this);
        this.showNotification = this.showNotification.bind(this);
    }

    toggleAnnouncementCreateModal() {
        this.setState((state) => ({
            announcementCreateModalOpen: !state.announcementCreateModalOpen,
        }));
    }

    toggleAnnouncementDeleteModal(announcement: AnnouncementDto | null) {
        this.setState(() => ({ announcementToDelete: announcement }));
    }

    toggleQueueCreateModal() {
        this.setState((state) => ({
            queueCreateModalOpen: !state.queueCreateModalOpen,
        }));
    }

    toggleQueueDeleteModal(queue: QueueDto | null) {
        this.setState(() => ({
            queueToDelete: queue,
        }));
    }

    render() {
        const roomCode = this.props.match.params.rid;
        const room = this.props.room(roomCode);
        if (room != null) {
            const title = `Room: ${room!.name} (${room!.code})`;
            setPageTitle(title);
            return buildContent(title, this.buildContent());
        } else if (this.state.connectionState === ConnectionState.Closed) {
            return buildBigCenterMessage("Oops! Room not found.", faSadCry);
        } else {
            return buildContent("Connecting to room...", null);
        }
    }

    componentDidMount() {
        this.props.requestCurrentParticipant(
            Number(this.props.match.params.cid),
        );
        this.props.fetchRooms(this.props.match.params.cid);
        this.props.requestAssignmentSets(Number(this.props.match.params.cid));
        // Start listening to our service worker for responses to the notifications
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener(
                "message",
                (event: MessageEvent) => {
                    if (event.data === "accept") {
                        if (this.acceptedParticipant != null) {
                            this.props.acceptParticipant(
                                Number(this.props.match.params.cid),
                                this.props.match.params.rid,
                                this.acceptedParticipant!.queueId,
                                this.acceptedParticipant!.participantId,
                            );
                            this.acceptedParticipant = null;
                        }
                    } else if (event.data === "focus") {
                        this.acceptedParticipant = null;
                        window.focus();
                    }
                },
            );
        }
        // Start listening to the websocket for changes to the queuing state
        this.connect();
    }

    componentDidUpdate(
        prevprops: QueuingPageProps & RouteComponentProps<any>,
        _: QueuingPageState,
    ) {
        // Upgrade to TA mode if necessary
        if (
            this.props.participant != null &&
            this.props.participant.role.name !== API_STUDENT_ROLE &&
            this.state.mode === QueuingMode.Student
        ) {
            this.setState({
                mode: QueuingMode.TA,
            });
        }

        // Send notifications to TA if someone entered while all queues were empty
        if (this.state.mode === QueuingMode.TA) {
            const prevEntries = prevprops.queues!.reduce(
                (count: number, queue: QueueDto) =>
                    count + queue.participants.length,
                0,
            );
            const curEntries = this.props.queues!.reduce(
                (count: number, queue: QueueDto) =>
                    count + queue.participants.length,
                0,
            );
            // If all queues were previously empty and now they are not.
            if (prevEntries === 0 && curEntries > 0) {
                // Get required information
                const queue = this.props.queues!.find(
                    (q: QueueDto) => q.participants.length > 0,
                );
                const participant = queue!.participants[0];
                this.showNotification("Someone entered a queue!", {
                    body: `${participant.fullName} has added themself to the '${
                        queue!.name
                    }' queue!`,
                    actions: [
                        {
                            action: "accept",
                            title: "Accept",
                        },
                    ],
                });
                this.acceptedParticipant = {
                    queueId: queue!.id,
                    participantId: participant.id,
                };
            }
        }
    }

    componentWillUnmount() {
        if (this.sock != null) {
            this.sock.close();
            this.sock.removeEventListener("open", this.onSockOpen);
            this.sock.removeEventListener("close", this.onSockClose);
            this.sock.removeEventListener("message", this.onSockMessage);
            this.sock.removeEventListener("error", this.onSockError);
        }
    }

    private handleReminder(reminder: RemindDto) {
        if (this.state.mode === QueuingMode.Student) {
            // If student will be helped or is reminded, he should get a notification
            if (reminder.participant.id === this.props.participant!.id) {
                this.setState({ reminder });
                this.showNotification("It is your turn!", {
                    body: "Raise your hand to get the TAs attention.",
                });
            }
        }
    }

    private showNotification(title: string, options: NotificationOptions) {
        if (!document.hasFocus()) {
            if (
                registration != null &&
                typeof registration.showNotification === "function"
            ) {
                registration.showNotification(title, options);
            } else if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                // @ts-ignore
                const _ = new Notification(title, options);
            }
        }
    }

    private buildPopup() {
        const { mode, reminder, newAnnouncement } = this.state;
        if (mode === QueuingMode.Student) {
            return (
                <Fragment>
                    {newAnnouncement != null && (
                        <PopupModal
                            announcement={newAnnouncement}
                            onCloseModal={() =>
                                this.setState(() => ({ newAnnouncement: null }))
                            }
                            closeable
                        />
                    )}
                    {reminder != null &&
                        this.props.participant != null &&
                        reminder.participant.id ===
                            this.props.participant.id && (
                            <PopupModal
                                onCloseModal={() =>
                                    this.setState(() => ({ reminder: null }))
                                }
                                reminder={reminder}
                                closeable
                            />
                        )}
                </Fragment>
            );
        } else {
            return null;
        }
    }

    // TODO proper error handling and recovering connection
    private connect() {
        // TODO remove this crap when not needed anymore
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        const port = location.port.length > 0 ? `:${location.port}` : "";
        const wsUrl = `${protocol}://${
            location.hostname
        }${port}/ws/queuing/rooms/${this.props.match.params.rid}/feed`;
        if (this.sock != null) {
            this.sock.close();
            this.sock.removeEventListener("open", this.onSockOpen);
            this.sock.removeEventListener("close", this.onSockClose);
            this.sock.removeEventListener("message", this.onSockMessage);
            this.sock.removeEventListener("error", this.onSockError);
        }
        this.sock = new WebSocket(wsUrl);
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
        const data = JSON.parse(event.data);
        const type: UpdateType = data.type;

        switch (type) {
            case "ACCEPT": {
                const reminder: RemindDto = {
                    participant: (data as AcceptDto).participant,
                    roomCode: (data as AcceptDto).roomCode,
                    type,
                };
                this.handleReminder(reminder);
                break;
            }
            case "REMIND": {
                const reminder: RemindDto = data as RemindDto;
                this.handleReminder(reminder);
                break;
            }
            case "ADD_ANNOUNCEMENT": {
                const newAnnouncement: AnnouncementDto = (data as AddAnnouncementDto)
                    .announcement;
                this.setState(() => ({ newAnnouncement }));
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

    private buildContent() {
        const { participant, queues } = this.props;
        const { connectionState } = this.state;
        if (
            connectionState === ConnectionState.Connecting ||
            (connectionState === ConnectionState.Connected && queues == null) ||
            participant == null
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
                    {"Notification" in window &&
                        Notification.permission !== "granted" && (
                            <Alert color="danger">
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    size="lg"
                                    className="mr-3"
                                />
                                We highly recommend{" "}
                                <a
                                    className="border-bottom cursor-pointer border-dark text-dark"
                                    onClick={() => {
                                        Notification.requestPermission().then(
                                            (p) => {
                                                if (p === "granted") {
                                                    window.location.reload();
                                                }
                                            },
                                        );
                                    }}
                                >
                                    allowing browser notifications
                                </a>{" "}
                                in order to effectively make use of the queuing
                                system.
                                <small className="ml-2">
                                    <abbr
                                        title="You can manually set the notification
                                permissions by clicking the lock icon next to the URL. Make sure to refresh
                                the page after you have made changes to the permissions."
                                    >
                                        More help
                                    </abbr>
                                </small>
                            </Alert>
                        )}
                    {this.buildTaTools()}
                    {this.buildAnnouncements()}
                    {this.buildQueues()}
                    {this.buildPopup()}
                </div>
            );
        } else {
            return buildBigCenterMessage("Unknown error occurred", faTimes);
        }
    }

    private buildTaTools() {
        if (this.state.mode !== QueuingMode.TA) {
            return null;
        } else {
            const {
                queueCreateModalOpen,
                queueToDelete,
                announcementCreateModalOpen,
                announcementToDelete,
            } = this.state;
            const {
                assignmentSets,
                createQueue,
                createAnnouncement,
            } = this.props;
            return (
                <div className="mb-3">
                    <div className="d-none d-lg-block">
                        <Button
                            outline
                            color="success"
                            onClick={this.toggleQueueCreateModal}
                            className="mr-2"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Create a queue
                        </Button>
                        <Button
                            outline
                            color="success"
                            className="mr-2"
                            onClick={this.toggleAnnouncementCreateModal}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Create an announcement
                        </Button>
                    </div>
                    <div className="d-sm-flex d-lg-none flex-wrap">
                        <Button
                            outline
                            block
                            color="success"
                            onClick={this.toggleQueueCreateModal}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Create a queue
                        </Button>
                        <Button
                            outline
                            block
                            color="success"
                            onClick={this.toggleAnnouncementCreateModal}
                        >
                            <FontAwesomeIcon
                                icon={faBullhorn}
                                className="mr-2"
                            />
                            Create an announcement
                        </Button>
                    </div>
                    {queueCreateModalOpen && assignmentSets != null && (
                        <QueueCreateModal
                            isOpen={queueCreateModalOpen}
                            assignmentSets={assignmentSets}
                            onCloseModal={this.toggleQueueCreateModal}
                            onCreate={(
                                name: string,
                                assignmentSetId: number | null,
                            ) => {
                                createQueue(
                                    name,
                                    assignmentSetId,
                                    Number(this.props.match.params.cid),
                                    this.props.match.params.rid,
                                );
                            }}
                        />
                    )}
                    {queueToDelete != null && (
                        <QueueDeleteModal
                            isOpen={queueToDelete != null}
                            onCloseModal={() =>
                                this.toggleQueueDeleteModal(null)
                            }
                            queue={queueToDelete}
                        />
                    )}
                    {announcementCreateModalOpen && (
                        <AnnouncementCreateModal
                            isOpen={announcementCreateModalOpen}
                            onCloseModal={this.toggleAnnouncementCreateModal}
                            onCreate={(announcement: string) =>
                                createAnnouncement(
                                    this.props.match.params.rid,
                                    Number(this.props.match.params.cid),
                                    announcement,
                                )
                            }
                        />
                    )}
                    {announcementToDelete != null && (
                        <AnnouncementDeleteModal
                            isOpen={announcementToDelete != null}
                            onCloseModal={() =>
                                this.toggleAnnouncementDeleteModal(null)
                            }
                            announcement={announcementToDelete}
                        />
                    )}
                </div>
            );
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
                    toggle={
                        this.state.mode === QueuingMode.TA
                            ? () => this.toggleAnnouncementDeleteModal(a)
                            : undefined
                    }
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
        const { mode } = this.state;
        return (
            <Row className="row-eq-height">
                {this.props.queues!.map((queue: QueueDto) => (
                    <Queue
                        title={queue.name}
                        entries={queue.participants.map(
                            (participant: QueueParticipantDto) => ({
                                participant,
                                onAccept: () =>
                                    this.props.acceptParticipant(
                                        Number(this.props.match.params.cid),
                                        this.props.match.params.rid,
                                        queue.id,
                                        participant.id,
                                    ),
                                onDeny: () =>
                                    this.props.dequeueParticipant(
                                        Number(this.props.match.params.cid),
                                        this.props.match.params.rid,
                                        queue.id,
                                        participant.id,
                                    ),
                            }),
                        )}
                        currentParticipant={this.props.participant!}
                        key={queue.id}
                        mode={this.state.mode!}
                        onJoinQueue={() =>
                            this.props.enqueue(
                                Number(this.props.match.params.cid),
                                this.props.match.params.rid,
                                queue.id,
                            )
                        }
                        onDeleteQueue={() => this.toggleQueueDeleteModal(queue)}
                        onAcceptNext={() =>
                            this.props.acceptNext(
                                Number(this.props.match.params.cid),
                                this.props.match.params.rid,
                                queue.id,
                            )
                        }
                    />
                ))}
                {mode === QueuingMode.TA && (
                    <Fragment>
                        <History taMode={mode === QueuingMode.TA} />
                        <Busyness roomCode={this.props.match.params.rid} />
                    </Fragment>
                )}
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            announcements: getAnnouncements(state),
            queues: getQueues(state),
            participant: getCurrentParticipant(state),
            assignmentSets: getAssignmentSets(state),
            room: (roomCode: string) => getRoom(state, roomCode),
        }),
        {
            fetchRooms: roomsFetchRequestedAction,
            createAnnouncement: (
                rid: string,
                cid: number,
                announcement: string,
            ) => announcementCreatedAction(rid, cid, announcement),
            deleteAnnouncement: (rid: string, cid: number, id: string) =>
                announcementRemovedAction(cid, rid, id),
            acceptParticipant: (
                cid: number,
                rid: string,
                qid: string,
                pid: number,
            ) => acceptRequestedAction(cid, rid, qid, pid),
            dequeueParticipant: (
                cid: number,
                rid: string,
                qid: string,
                pid: number,
            ) => dequeueRequestedAction(cid, rid, qid, pid),
            updateReceived: (update: UpdateDto) => updateReceivedAction(update),
            requestCurrentParticipant: (cid: number) =>
                currentParticipantRequestedAction(cid),
            requestAssignmentSets: (cid: number) =>
                assignmentSetsFetchRequestedAction(cid),
            createQueue: (
                name: string,
                asid: number | null,
                cid: number,
                rid: string,
            ) => queueCreatedAction(asid, cid, rid, name),
            enqueue: (cid: number, rid: string, qid: string) =>
                enterQueueAction(cid, rid, qid),
            deleteQueue: (cid: number, rid: string, qid: string) =>
                queueRemovedAction(cid, rid, qid),
            acceptNext: (cid: number, rid: string, qid: string) =>
                acceptNextAction(cid, rid, qid),
        },
    )(QueuingPage),
);
