import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";
import queryString from "query-string";

import { Row, Col } from "reactstrap";

import {
    SignOffResultDtoCompact,
    GroupDtoFull,
    AssignmentSetDtoFull,
    ParticipantDto,
    AssignmentDtoBrief,
    GroupDtoSummary,
    SignOffResultType,
} from "../../../api/types";
import { ApplicationState } from "../../../state/state";

import {
    SignOffChange,
    SignOffChangeResult,
} from "../../../state/sign-off/types";

import {
    signOffResultsRequestedAction,
    signOffSaveRequestedAction,
    SignOffSaveRequestedAction,
    SignOffResultsRequestedAction,
} from "../../../state/sign-off/actions";

import {
    getRemoteSignoffs,
    getGroup,
    getAssignmentSet,
} from "../../../state/sign-off/selectors";

import CommentModal, { CommentModalProps } from "./CommentModal";
import SignOffSearch from "./SignOffSearch";
import GroupTableCell from "./GroupTableCell";
import ParticipantTableCell from "./ParticipantTableCell";
import AssignmentTableCell from "./AssignmentTableCell";
import SignoffResultTableCell from "./SignoffResultTableCell";
import { buildContent } from "../../pagebuilder";

interface SignoffTableProps {
    signoffs: SignOffResultDtoCompact[] | null;
    group: GroupDtoFull | null;
    assignmentSet: AssignmentSetDtoFull | null;

    fetchSignOffs: (
        asid: number,
        cid: number,
        gid: number,
    ) => SignOffResultsRequestedAction;
    saveChanges: (
        localChanges: SignOffChange[],
        asid: number,
    ) => SignOffSaveRequestedAction;
}

interface SignoffTableState {
    changes: SignOffChange[];
    comment: {
        group: GroupDtoSummary | null;
        participant: ParticipantDto | null;
        assignment: AssignmentDtoBrief | null;
        signOffResult: SignOffResultDtoCompact | null;
    };
    modal: CommentModalProps | null;
}

interface SignOffChangeRequest {
    pid: number;
    aid: number;
    result: SignOffChangeResult;
}

const initialState = {
    changes: [],
    comment: {
        group: null,
        participant: null,
        assignment: null,
        signOffResult: null,
    },
    modal: null,
};
/**
 * Sign off table page component.
 */
class SignoffTable extends Component<
    SignoffTableProps & RouteComponentProps<any>,
    SignoffTableState
> {
    /**
     * @override
     */
    constructor(props: SignoffTableProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            ...initialState,
        };
    }

    /**
     * @override
     */
    componentDidMount() {
        this.reloadData();
    }

    /**
     * @override
     */
    componentDidUpdate(
        prevProps: SignoffTableProps & RouteComponentProps<any>,
    ) {
        const oldParams = prevProps.match.params;
        const newParams = this.props.match.params;

        const oldGroup = Number(
            queryString.parse(prevProps.location.search).g!,
        );

        const newGroup = Number(
            queryString.parse(this.props.location.search).g!,
        );

        const oldAssignmentSet = Number(
            queryString.parse(prevProps.location.search).as!,
        );

        const newAssignmentSet = Number(
            queryString.parse(this.props.location.search).as!,
        );

        if (
            !isNaN(newGroup) &&
            newGroup > 0 &&
            !isNaN(newAssignmentSet) &&
            newAssignmentSet > 0 &&
            (oldGroup !== newGroup ||
                oldAssignmentSet !== newAssignmentSet ||
                oldParams.cid !== newParams.cid)
        ) {
            this.setState({ ...initialState }, () => this.reloadData());
        }
    }

    /**
     * @override
     */
    render() {
        return buildContent("Sign-off", this.buildContent());
    }

    private buildContent() {
        const { group, signoffs } = this.props;

        return (
            <div>
                <SignOffSearch
                    searchQuery={group != null ? group.name : undefined}
                />
                <Row className="px-2 flex-row justify-content-center">
                    <Col className="col-md-6 col-xs-12">
                        {signoffs != null && this.buildTable()}
                    </Col>
                    <Col className="col-md-6 col-xs-12" />

                    {this.state.modal && <CommentModal {...this.state.modal} />}
                </Row>
            </div>
        );
    }

    /**
     * Builds sign off table contents.
     */
    private buildTable() {
        const { group, assignmentSet } = this.props;
        const newGroup = Number(
            queryString.parse(this.props.location.search).g!,
        );

        const newAssignmentSet = Number(
            queryString.parse(this.props.location.search).as!,
        );

        if (
            group == null ||
            assignmentSet == null ||
            isNaN(newGroup) ||
            isNaN(newAssignmentSet) ||
            newGroup <= 0 ||
            newAssignmentSet <= 0
        ) {
            return null;
        } else {
            return (
                <div>
                    <table className="sign-off-table">
                        <thead>
                            <tr>
                                <GroupTableCell group={group} />
                                {group.participants.map((p) => (
                                    <ParticipantTableCell
                                        key={`p:${p.id}`}
                                        participant={p}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {assignmentSet.assignments.map((a) => (
                                <tr
                                    key={`a:${a.id}`}
                                    className="sign-off-table-row"
                                >
                                    <AssignmentTableCell
                                        assignment={a}
                                        disabled={
                                            !this.isAssignmentBatchSignable(
                                                a.id,
                                            )
                                        }
                                        onClick={() =>
                                            this.onAssignmentSignOffClick(a.id)
                                        }
                                    />
                                    {group.participants.map((p) => {
                                        const cellType = this.getLocalTypeForSignOff(
                                            p.id,
                                            a.id,
                                        );
                                        const unsaved = this.isCellUnsaved(
                                            p.id,
                                            a.id,
                                        );
                                        return (
                                            <SignoffResultTableCell
                                                key={`a:${a.id}:p:${p.id}`}
                                                signOffState={cellType}
                                                disabled={unsaved}
                                                unsaved={unsaved}
                                                onClick={() =>
                                                    this.onSignOffClick(
                                                        a.id,
                                                        p.id,
                                                    )
                                                }
                                            />
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    }

    /**
     * Handles a click on a single sign off cell.
     * Causes a specific participant's sign off result to be changed.
     * @param aid Assignment ID
     * @param pid Partcipant ID
     */
    private onSignOffClick(aid: number, pid: number) {
        const result = this.nextSignOffState(
            this.getLocalTypeForSignOff(pid, aid),
            this.hasChangedInSession(pid, aid),
        );
        this.onSignOffChangesRequested([
            {
                aid,
                pid,
                result,
            },
        ]);
    }

    /**
     * Handles a click on an assignment sign off cell.
     * Causes all participants' sign off results to be changed at once.
     * @param aid Assginment ID.
     */
    private onAssignmentSignOffClick(aid: number) {
        if (
            this.props.group == null ||
            this.props.group.participants.length === 0
        ) {
            return;
        }
        const participants = this.props.group.participants;
        const hasChanged = participants
            .map((p) => this.hasChangedInSession(p.id, aid))
            .some((x) => x);
        const result = this.nextSignOffState(
            this.getLocalTypeForSignOff(participants[0].id, aid),
            hasChanged,
        );
        this.onSignOffChangesRequested(
            participants.map((p) => ({
                aid,
                pid: p.id,
                result,
            })),
        );
    }

    /**
     * Performs sign off changes with possible comment prompts.
     * @param requests Batch of sign off changes.
     */
    private onSignOffChangesRequested(requests: SignOffChangeRequest[]) {
        // Changes for which a comment prompt is NOT needed
        const changeUpdates: SignOffChange[] = [];
        // Changes for which a comment prompt is not needed
        const changeUpdatesCommentsNeeded: SignOffChange[] = [];
        // Build changes from requests and categorize to comments needed/not needed
        requests.forEach((req) => {
            const { aid, pid, result } = req;
            // Check whether this signoff was previously changed in the same session
            const exists = this.hasChangedInSession(pid, aid);
            const signoff = this.findSignOff(pid, aid);
            const change = {
                id: signoff != null ? signoff.id : null,
                aid,
                pid,
                result,
                comment: null,
            };

            if (this.requiresComment(exists, result)) {
                changeUpdatesCommentsNeeded.push(change);
            } else {
                changeUpdates.push(change);
            }
        });
        if (changeUpdatesCommentsNeeded.length === 0) {
            // No comments needed; just commit changes and push to backend
            this.commitChangesAndPush(changeUpdates);
        } else {
            // Some require comments; open modal
            this.openCommentModal(
                "Leave a comment for this sign off.",
                () => this.closeCommentModal(),
                (comment) => {
                    // Apply comment to those that needed a coomment and push
                    changeUpdatesCommentsNeeded.forEach((c) => {
                        c.comment = comment;
                    });
                    changeUpdates.push(...changeUpdatesCommentsNeeded);
                    this.commitChangesAndPush(changeUpdates);
                    this.closeCommentModal();
                },
                () => {
                    // User has chosen to not enter a comment; pusch all without comments
                    changeUpdates.push(...changeUpdatesCommentsNeeded);
                    this.commitChangesAndPush(changeUpdates);
                    this.closeCommentModal();
                },
            );
        }
    }

    /**
     * Determines if a comment prompt is required for a sign off change.
     * @param changedInSession Whether the specific sign off has been previously changed in current session.
     * @param newResult New sign off result to be changed tos
     */
    private requiresComment(
        changedInSession: boolean,
        newResult: SignOffChangeResult,
    ): boolean {
        switch (newResult) {
            case SignOffChangeResult.Sufficient:
                return false;
            case SignOffChangeResult.Insufficient:
                return true;
            case SignOffChangeResult.Unattempted:
                return !changedInSession;
        }
    }

    /**
     * Commits pending changes to state and pushed to backend afterwards.
     * @param changes Sign off changes to commit to state and push to backend.
     */
    private commitChangesAndPush(changes: SignOffChange[]) {
        this.setState(
            (state) => {
                const newChanges = [...state.changes];
                changes.forEach((change) => {
                    const current = this.state.changes.findIndex(
                        (c: SignOffChange) =>
                            c.aid === change.aid && c.pid === change.pid,
                    );
                    if (current >= 0) {
                        newChanges[current] = change;
                    } else {
                        newChanges.push(change);
                    }
                });
                return {
                    ...state,
                    changes: newChanges,
                };
            },
            () => {
                this.props.saveChanges(changes, this.props.assignmentSet!.id);
            },
        );
    }

    /**
     * Displays the SignOff comment prompt.
     * @param message Message to display.
     * @param onCancelClick Callback on cancel click.
     * @param onCommentClick Callback on comment click.
     * @param onNoCommentClick Callback on no comment click.
     */
    private openCommentModal(
        message: string,
        onCancelClick: () => void,
        onCommentClick: (comment: string) => void,
        onNoCommentClick: () => void,
    ) {
        this.setState({
            modal: {
                message,
                onCancelClick,
                onCommentClick,
                onNoCommentClick,
            },
        });
    }

    /**
     * Hides the SignOff comment prompt.
     */
    private closeCommentModal() {
        this.setState({ modal: null });
    }

    /**
     * Gets next state in sign off result progression.
     * @param signOff Current sign off result state.
     * @param hasChanged Whether the sign off has changed in the session.
     */
    private nextSignOffState(
        signOff: SignOffChangeResult,
        hasChanged: boolean,
    ) {
        switch (signOff) {
            case SignOffChangeResult.Sufficient:
                return SignOffChangeResult.Insufficient;
            case SignOffChangeResult.Insufficient:
                return hasChanged
                    ? SignOffChangeResult.Unattempted
                    : SignOffChangeResult.Sufficient;
            case SignOffChangeResult.Unattempted:
                return SignOffChangeResult.Sufficient;
        }
    }

    /**
     * Checks whether a specific sign off change has not been saved by
     * comparing remote sign offs with changes in state.
     * @param pid Participant ID.
     * @param aid Assignment ID.
     */
    private isCellUnsaved(pid: number, aid: number) {
        const change = this.findChange(pid, aid);
        const signoff = this.findSignOff(pid, aid);

        if (change != null) {
            return (
                this.signOffResultToChange(
                    signoff != null ? signoff.result : null,
                ) !== change.result
            );
        }
        return false;
    }

    /**
     * Converts remote sign off result type to internal enum.
     * @param result Remote sign off result.
     */
    private signOffResultToChange(
        result: SignOffResultType | null,
    ): SignOffChangeResult {
        switch (result) {
            case "INSUFFICIENT":
                return SignOffChangeResult.Insufficient;
            case "COMPLETE":
                return SignOffChangeResult.Sufficient;
        }
        return SignOffChangeResult.Unattempted;
    }

    /**
     * Check sif an assignment signoff is changeable for all participants at once.
     * @param aid Assignment ID.
     */
    private isAssignmentBatchSignable(aid: number): boolean {
        if (
            this.props.group == null ||
            this.props.group.participants.length === 0
        ) {
            return false;
        }
        const saved = this.props.group.participants
            .map((p) => this.isCellUnsaved(p.id, aid))
            .every((x) => !x);
        const results = this.props.group.participants.map((p) =>
            this.getLocalTypeForSignOff(p.id, aid),
        );
        const identical = results.every((x) => x === results[0]);

        return saved && identical;
    }

    /**
     * Gets local cell type enum for a remote sign off.
     * @param pid Participant ID.
     * @param aid Assignment ID.
     */
    private getLocalTypeForSignOff(pid: number, aid: number) {
        const signoff = this.findSignOff(pid, aid);

        if (signoff == null) {
            return SignOffChangeResult.Unattempted;
        } else {
            switch (signoff.result) {
                case "COMPLETE":
                    return SignOffChangeResult.Sufficient;
                case "INSUFFICIENT":
                    return SignOffChangeResult.Insufficient;
                default:
                    return SignOffChangeResult.Unattempted;
            }
        }
    }

    /**
     * Finds a remote sign off.
     * @param pid Participant ID.
     * @param aid Assignment ID.
     */
    private findSignOff(
        pid: number,
        aid: number,
    ): SignOffResultDtoCompact | undefined {
        return this.props.signoffs!.find(
            (signOff: SignOffResultDtoCompact) =>
                signOff.assignmentId === aid && signOff.participantId === pid,
        );
    }

    /**
     * Finds a change in the local state.
     * @param pid Participant ID.
     * @param aid Assignment ID.
     */
    private findChange(pid: number, aid: number): SignOffChange | undefined {
        return this.state.changes.find(
            (c: SignOffChange) => c.aid === aid && c.pid === pid,
        );
    }

    /**
     * Determines whether a sign off has changed in this session.
     * @param pid Participant ID.
     * @param aid Assignment ID.
     */
    private hasChangedInSession(pid: number, aid: number): boolean {
        return (
            this.state.changes.findIndex(
                (c) => c.aid === aid && c.pid === pid,
            ) >= 0
        );
    }

    /**
     * Reloads component data.
     */
    private reloadData() {
        const groupId = Number(
            queryString.parse(this.props.location.search).g!,
        );
        const assignmentSetId = Number(
            queryString.parse(this.props.location.search).as!,
        );
        const courseId = Number(this.props.match.params.cid);
        if (!(isNaN(groupId) || isNaN(assignmentSetId) || isNaN(courseId))) {
            this.props.fetchSignOffs(assignmentSetId, courseId, groupId);
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            signoffs: getRemoteSignoffs(state),
            group: getGroup(state),
            assignmentSet: getAssignmentSet(state),
        }),
        {
            fetchSignOffs: signOffResultsRequestedAction,
            saveChanges: signOffSaveRequestedAction,
        },
    )(SignoffTable),
);
