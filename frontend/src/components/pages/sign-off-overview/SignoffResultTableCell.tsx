import React, { Component } from "react";

import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    SignOffResultDtoCompact,
    AssignmentDtoBrief,
    GroupDtoSummary,
    ParticipantDtoBrief,
    CommentThreadDtoFull,
} from "../../../api/types";
import CommentThread from "../../comments/CommentThread";
import { EntityType } from "../../../state/comments/types";
import { centerSpinner } from "../../pagebuilder";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";
import { getCommentThread } from "../../../state/comments/selectors";
import ParticipantLabelInfo from "../admin/labels/ParticipantLabelInfo";
import { getCoursePermissions } from "../../../state/auth/selectors";
import CoursePermissions from "../../../api/permissions";
import { labelAnyView } from "../../../state/auth/constants";
import { withRouter, RouteComponentProps } from "react-router";
import SignOffDetails from "../sign-off/SignOffDetails";

interface SignoffResultTableCellProps {
    signOffState: string;
    style: React.CSSProperties;
    className: string;

    signOff: SignOffResultDtoCompact | null;
    assignment: AssignmentDtoBrief;
    group: GroupDtoSummary;
    participant: ParticipantDtoBrief;
    onCommentClick: (comments: JSX.Element) => void;
    coursePermissions: CoursePermissions | null;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class SignoffResultTableCell extends Component<
    SignoffResultTableCellProps & RouteComponentProps<any>
> {
    lastClick: number;

    constructor(props: SignoffResultTableCellProps & RouteComponentProps<any>) {
        super(props);
        this.lastClick = 0;
    }

    render() {
        const { signOffState, className, style } = this.props;
        let classNameFinal = className;
        switch (signOffState) {
            case "COMPLETE":
                classNameFinal += " overview-table-cell-complete";
                break;
            case "INSUFFICIENT":
                classNameFinal += " overview-table-cell-insufficient";
                break;
            default:
                break;
        }

        if (this.props.onCommentClick && this.props.signOff != null) {
            return (
                <div
                    className={
                        classNameFinal +
                        " d-flex align-items-center justify-content-center cursor-pointer"
                    }
                    style={style}
                    onClick={() =>
                        this.props.onCommentClick(this.buildComments())
                    }
                >
                    {this.highlightIcon() && (
                        <div
                            className={`overview-table-cell-sign-off-comment-buttonicon-highlighted`}
                        >
                            <FontAwesomeIcon icon={faComments} size="lg" />
                        </div>
                    )}
                </div>
            );
        } else {
            return null;
        }
    }

    private buildComments() {
        const {
            participant,
            group,
            signOff,
            assignment,
            coursePermissions,
        } = this.props;
        const canViewLabels = labelAnyView.check(
            Number(this.props.match.params.cid),
            coursePermissions!,
        );

        if (signOff == null) {
            return centerSpinner();
        } else {
            return (
                <div>
                    <h4>Sign-off details:</h4>
                    <SignOffDetails
                        participantId={participant.id}
                        assignmentId={assignment.id}
                    />
                    {canViewLabels && (
                        <div>
                            <h4>
                                Labels assigned to{" "}
                                {participant.person.shortName}:
                            </h4>
                            <ParticipantLabelInfo
                                participantId={participant.id}
                            />
                        </div>
                    )}
                    <h4>Comments:</h4>
                    <CommentThread
                        commentThreadId={
                            signOff.commentThreadId != null
                                ? signOff.commentThreadId
                                : null
                        }
                        commentThreadSubject={`Sign-off: ${assignment.name}`}
                        linkedEntityId={signOff.id}
                        linkedEntityType={EntityType.Signoff}
                        showCommentThreadContent={true}
                    />
                    <CommentThread
                        commentThreadId={
                            participant.commentThread != null
                                ? participant.commentThread.id
                                : null
                        }
                        commentThreadSubject={participant.person.fullName}
                        linkedEntityId={participant.id}
                        linkedEntityType={EntityType.Participant}
                        showCommentThreadContent={false}
                    />
                    <CommentThread
                        commentThreadId={
                            group.commentThread != null
                                ? group.commentThread.id
                                : null
                        }
                        commentThreadSubject={group.name}
                        linkedEntityId={group.id}
                        linkedEntityType={EntityType.Group}
                        showCommentThreadContent={false}
                    />
                    <CommentThread
                        commentThreadId={
                            assignment.commentThreadId != null
                                ? assignment.commentThreadId
                                : null
                        }
                        commentThreadSubject={assignment.name}
                        linkedEntityId={assignment.id}
                        linkedEntityType={EntityType.Assignment}
                        showCommentThreadContent={false}
                    />
                </div>
            );
        }
    }

    private highlightIcon() {
        const { signOff, commentThread } = this.props;
        if (signOff != null) {
            return (
                signOff.commentThreadId != null ||
                commentThread(signOff.id, EntityType.Signoff) != null
            );
        } else {
            return false;
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            commentThread: (entityId: number, entityType: EntityType) =>
                getCommentThread(state, entityId, entityType),
            coursePermissions: getCoursePermissions(state),
        }),
        {},
    )(SignoffResultTableCell),
);
