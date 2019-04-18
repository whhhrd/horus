import React, { Component, Fragment } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Button, Alert } from "reactstrap";

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
    QueuingMode,
    AcceptedParticipant,
    ConnectionState,
} from "../../../state/queuing/types";
import {
    announcementCreatedAction,
    announcementRemovedAction,
    AnnouncementCreatedAction,
    AnnouncementRemovedAction,
    acceptRequestedAction,
    AcceptRequestedAction,
    updateReceivedAction,
    UpdateReceivedAction,
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
import { getAnnouncements, getQueues } from "../../../state/queuing/selectors";
import { ApplicationState } from "../../../state/state";
import { registration } from "../../..";
import { API_STUDENT_ROLE } from "../../../state/courses/constants";
import {
    assignmentSetsFetchRequestedAction,
    AssignmentSetsFetchAction,
} from "../../../state/assignments/actions";
import {
    getAssignmentSets,
    getAssignmentGroupSetsMappingDtos,
} from "../../../state/assignments/selectors";
import { getRoom } from "../../../state/rooms/selectors";
import {
    RoomsFetchRequestedAction,
    roomsFetchRequestedAction,
} from "../../../state/rooms/action";

import QueueCreateModal from "./QueueCreateModal";
import AnnouncementCreateModal from "./AnnouncementCreateModal";
import AnnouncementDeleteModal from "./AnnouncementDeleteModal";
import QueueDeleteModal from "./QueueDeleteModal";
import History from "./History";
import Busyness from "./Busyness";
import { QueuingSocket } from "./QueuingSocket";
import Queue from "./Queue";
import PopupModal from "./PopupModal";
import {
    buildContent,
    buildBigCenterMessage,
    buildConnectingSpinner,
} from "../../pagebuilder";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDoorClosed,
    faTimes,
    faPlus,
    faSadCry,
    faBullhorn,
    faExclamationTriangle,
    faBell,
} from "@fortawesome/free-solid-svg-icons";
import {
    CurrentParticipantRequestedAction,
    currentParticipantRequestedAction,
} from "../../../state/courses/action";
import { getCurrentParticipant } from "../../../state/courses/selectors";

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

/**
 * A page that displays the existing queues within a given room.
 * Besides displaying the queues, it displays the existing
 * announcements and room history, as well as the busyness in other
 * rooms.
 *
 * Depending on the permissions of the user, multiple actions can be
 * performed, such as creating a new queue and creating an announcement.
 *
 * A student is only permitted to join and leave a queue.
 */
class QueuingPage extends Component<
    QueuingPageProps & RouteComponentProps<any>,
    QueuingPageState
> {
    private acceptedParticipant: AcceptedParticipant | null = null;
    private queuingSocket: QueuingSocket | null = null;
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
            return buildContent(
                `Room: ${room!.name} (${room!.code})`,
                this.buildContent(),
            );
        } else if (this.state.connectionState === ConnectionState.NotFound) {
            return buildContent(
                "",
                buildBigCenterMessage("Oops! Room not found.", faSadCry),
            );
        } else if (this.state.connectionState === ConnectionState.Closed) {
            return buildContent(
                "",
                buildBigCenterMessage("Rooms is closed.", faDoorClosed),
            );
        } else {
            return buildContent("Connecting to room...", null);
        }
    }

    componentDidMount() {
        const courseId = this.props.match.params.cid;
        this.props.requestCurrentParticipant(Number(courseId));
        this.props.fetchRooms(courseId);
        this.props.requestAssignmentSets(Number(courseId));

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

        this.queuingSocket = new QueuingSocket(
            this.props.match.params.rid,
            this.onSockOpen,
            this.onSockClose,
            this.onSockMessage,
            this.onSockError,
            this,
        );
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
        if (this.queuingSocket != null) {
            this.queuingSocket.shutdown();
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
                    {this.buildNotificationWarning()}
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

    /**
     * Builds a warning when the user has not accepted the permissions
     * for browser notifications. A button will be displayed which, when
     * clicked, opens the notification permission prompt.
     */
    private buildNotificationWarning() {
        if ("Notification" in window && Notification.permission !== "granted") {
            const abbr = (
                <abbr
                    title="You can manually set the notification
                        permissions by clicking the lock icon next to the URL. Make sure to refresh
                        the page after you have made changes to the permissions."
                >
                    More help
                </abbr>
            );

            const alertText =
                "We highly recommend allowing browser notifications in " +
                "order to effectively make use of the queuing system.";

            return (
                <Fragment>
                    {/* For desktop: */}
                    <Alert
                        color="danger"
                        style={{ fontSize: "16pt" }}
                        className="d-none d-lg-flex flex-row flex-nowrap align-items-center"
                    >
                        <div className="mr-5 ml-3 flex-nowrap d-flex flex-shrink-0">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                size="2x"
                                className="mr-5"
                            />
                            <Button
                                color="danger"
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
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="mr-2"
                                />{" "}
                                Enable browser notifications
                            </Button>{" "}
                        </div>
                        <div className="text-center">
                            {alertText}
                            <small className="ml-2">{abbr}</small>
                        </div>
                    </Alert>

                    {/* For phone: */}
                    <Alert
                        color="danger"
                        style={{ fontSize: "14pt" }}
                        className="d-flex flex-column d-lg-none flex-nowrap align-items-center"
                    >
                        <div className="mb-4 mt-2">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                size="3x"
                            />
                        </div>
                        <div className="text-center mb-3">{alertText}</div>
                        <div className="w-100 mb-2">
                            <Button
                                color="danger"
                                block
                                size="lg"
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
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="mr-2"
                                />{" "}
                                Enable browser notifications
                            </Button>{" "}
                        </div>
                    </Alert>
                </Fragment>
            );
        } else {
            return null;
        }
    }

    /**
     * Builds the buttons and the modals that the
     * teaching staff will need to manage the room,
     * such ass the ability to create rooms and announcement.
     */
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

    /**
     * Builds the announcement that are currently
     * active within the room.
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

    /**
     * Builds the queues that exist within the room
     */
    private buildQueues() {
        const { mode } = this.state;
        const { assignmentSets } = this.props;

        if (assignmentSets == null) {
            return null;
        }

        return (
            <Row className="row-eq-height">
                {this.props.queues!.map((queue: QueueDto) => {
                    // Check if the participant can join the queue
                    // Can only join the queue if the participant is a student
                    // and if the student is mapped via a group to the assignment set
                    const asid = queue.assignmentSetId;
                    const linkedAssignmentSet = assignmentSets.find(
                        (as) => as.id === asid,
                    );
                    const canJoin =
                        mode === QueuingMode.Student && (asid == null ||
                        linkedAssignmentSet != null);

                    return (
                        <Queue
                            queue={queue}
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
                            onJoinQueue={
                                canJoin
                                    ? () =>
                                          this.props.enqueue(
                                              Number(
                                                  this.props.match.params.cid,
                                              ),
                                              this.props.match.params.rid,
                                              queue.id,
                                          )
                                    : undefined
                            }
                            onDeleteQueue={() =>
                                this.toggleQueueDeleteModal(queue)
                            }
                            onAcceptNext={() =>
                                this.props.acceptNext(
                                    Number(this.props.match.params.cid),
                                    this.props.match.params.rid,
                                    queue.id,
                                )
                            }
                        />
                    );
                })}
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
            assignmentGroupSetMappings: getAssignmentGroupSetsMappingDtos(
                state,
            ),
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
