import React, { Component } from "react";
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
    RemindDto,
    ParticipantDto,
    UpdateDto,
    ParticipantDtoBrief,
    AssignmentSetDtoBrief,
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
    resetReminderAction,
    ResetReminderAction,
    resetNewAnnouncementAction,
    ResetNewAnnouncementAction,
    acceptNextAction,
    AcceptNextAction,
} from "../../../state/queuing/actions";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import {
    getAnnouncements,
    getHistory,
    getQueues,
    getCurrentParticipant,
    getNewAnnouncement,
    getReminder,
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
import { buildContent, buildBigCenterMessage, buildConnectingSpinner } from "../../pagebuilder";
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
    faBullhorn,
    faHistory,
} from "@fortawesome/free-solid-svg-icons";
import QueueCreateModal from "./QueueCreateModal";
import AnnouncementCreateModal from "./AnnouncementCreateModal";
import AnnouncementDeleteModal from "./AnnouncementDeleteModal";
import QueueDeleteModal from "./QueueDeleteModal";
import HistoryModal from "./HistoryModal";

interface QueuingPageProps {
    announcements: AnnouncementDto[] | null;
    queueHistory: AcceptDto[] | null;
    queues: QueueDto[] | null;
    room: (roomCode: string) => RoomDto | null;
    reminder: RemindDto | null;
    participant: ParticipantDtoBrief | null;
    assignmentSets: AssignmentSetDtoBrief[] | null;
    newAnnouncement: AnnouncementDto | null;
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
    resetReminder: () => ResetReminderAction;
    resetNewAnnouncement: () => ResetNewAnnouncementAction;
    acceptNext: (cid: number, rid: string, qid: string) => AcceptNextAction;
}

interface QueuingPageState {
    mode: QueuingMode | null;
    connectionState: ConnectionState;

    queueCreateModalOpen: boolean;
    queueToDelete: QueueDto | null;

    announcementCreateModalOpen: boolean;
    announcementToDelete: AnnouncementDto | null;

    historyModalOpen: boolean;
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
            historyModalOpen: false,
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
        this.toggleHistoryModal = this.toggleHistoryModal.bind(this);
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

    toggleHistoryModal() {
        this.setState((state) => ({
            historyModalOpen: !state.historyModalOpen,
        }));
    }

    render() {
        const roomCode = this.props.match.params.rid;
        if (this.props.room(roomCode) != null) {
            return buildContent(
                `Room: ${this.props.room(roomCode)!.name} (${this.props.room(roomCode)!.code})`,
                this.buildContent(),
            );
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
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
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
                    body: `${
                        participant.fullName
                    } has added themself to the '${queue!.name}' queue!`,
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
        } else if (this.state.mode === QueuingMode.Student) {
            // If student will be helped or is reminded, he should get a notification
            if (
                this.props.reminder != null &&
                this.props.reminder.participant.id ===
                    this.props.participant!.id
            ) {
                this.showNotification("It is your turn!", {
                    body: "Raise your hand to get the TAs attention.",
                });
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

    private showNotification(title: string, options: NotificationOptions) {
        if (!document.hasFocus()) {
            if (registration != null && typeof registration.showNotification === "function") {
                registration.showNotification(title, options);
            } else if ("Notification" in window && Notification.permission === "granted") {
                // @ts-ignore
                const _ = new Notification(title, options);
            }
        }
    }

    private buildPopup() {
        if (
            this.state.mode === QueuingMode.Student &&
            this.props.newAnnouncement != null
        ) {
            return (
                <PopupModal
                    isOpen={true}
                    announcement={this.props.newAnnouncement.content}
                    onCloseModal={() => this.props.resetNewAnnouncement()}
                />
            );
        } else if (
            this.state.mode === QueuingMode.Student &&
            this.props.reminder != null &&
            this.props.reminder!.participant.id === this.props.participant!.id
        ) {
            return (
                <PopupModal
                    onCloseModal={() => this.props.resetReminder()}
                    isOpen={true}
                />
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
        const wsUrl = `${protocol}://${location.hostname}${port}/ws/queuing/rooms/${this.props.match.params.rid}/feed`;
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
        this.props.updateReceived(JSON.parse(event.data));
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
                    {this.buildTaTools()}
                    {this.buildAnnouncements()}
                    {this.buildQueues()}
                    {this.buildPopup()}
                </div>
            );
        } else {
            return buildBigCenterMessage(
                "Unknown error occurred",
                faTimes,
            );
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
                historyModalOpen,
                mode,
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
                        <Button
                            outline
                            color="success"
                            onClick={this.toggleHistoryModal}
                        >
                            <FontAwesomeIcon
                                icon={faHistory}
                                className="mr-2"
                            />
                            Show activity history
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
                        <Button
                            outline
                            block
                            color="success"
                            onClick={this.toggleHistoryModal}
                        >
                            <FontAwesomeIcon
                                icon={faHistory}
                                className="mr-2"
                            />
                            Show activity history
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
                    {historyModalOpen && (
                        <HistoryModal
                            isOpen={historyModalOpen}
                            onCloseModal={this.toggleHistoryModal}
                            mode={mode}
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
        return (
            <Row className="row-eq-height">
                {this.props.queues!.map((queue: QueueDto) => (
                    <Queue
                        title={queue.name}
                        entries={queue.participants.map(
                            (participant: ParticipantDto) => ({
                                name: participant.fullName,
                                participantId: participant.id,
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
            </Row>
        );
    }

    //     private buildProjectorButton() {
    //         if (this.state.mode === QueuingMode.Projector) {
    //             return (
    //                 <Button
    //                     onClick={() => {
    //                         this.setState({
    //                             mode: QueuingMode.TA,
    //                         });
    //                     }}
    //                 >
    //                     TA Mode
    //                 </Button>
    //             );
    //         } else if (this.state.mode === QueuingMode.TA) {
    //             return (
    //                 <Button
    //                     onClick={() => {
    //                         this.setState({
    //                             mode: QueuingMode.Projector,
    //                         });
    //                     }}
    //                 >
    //                     Projector Mode
    //                 </Button>
    //             );
    //         }
    //         return null;
    //     }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            announcements: getAnnouncements(state),
            queueHistory: getHistory(state),
            queues: getQueues(state),
            participant: getCurrentParticipant(state),
            assignmentSets: getAssignmentSets(state),
            newAnnouncement: getNewAnnouncement(state),
            reminder: getReminder(state),
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
            resetReminder: resetReminderAction,
            resetNewAnnouncement: resetNewAnnouncementAction,
            acceptNext: (cid: number, rid: string, qid: string) =>
                acceptNextAction(cid, rid, qid),
        },
    )(QueuingPage),
);
