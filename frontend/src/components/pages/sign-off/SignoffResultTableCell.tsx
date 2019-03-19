import React, { Component } from "react";

import { SignOffChangeResult } from "../../../state/sign-off/types";
import {
    faCheck,
    faTimes,
    faComments,
} from "@fortawesome/free-solid-svg-icons";
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
import SignOffDetails from "./SignOffDetails";

interface SignoffResultTableCellProps {
    signOffState: SignOffChangeResult;
    unsaved: boolean;
    disabled: boolean;
    onClick?: () => void;

    signOff: SignOffResultDtoCompact | null;
    assignment: AssignmentDtoBrief;
    group: GroupDtoSummary;
    participant: ParticipantDtoBrief;
    onCommentClick: (comments: JSX.Element) => void;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class SignoffResultTableCell extends Component<SignoffResultTableCellProps> {

    lastClick: number;

    constructor(props: SignoffResultTableCellProps)  {
        super(props);
        this.lastClick = 0;
    }

    render() {
        const { signOffState, unsaved, disabled } = this.props;
        let className;
        let icon;
        switch (signOffState) {
            case SignOffChangeResult.Sufficient:
                className = "sign-off-table-cell-complete";
                icon = faCheck;
                break;
            case SignOffChangeResult.Insufficient:
                className = "sign-off-table-cell-insufficient";
                icon = faTimes;
                break;
            default:
                className = "sign-off-table-cell-blank";
        }
        return (
            <td
                className={className}
                onClick={() => this.onClick()}
                style={{ cursor: disabled ? "default" : "pointer" }}
            >
                {!unsaved && icon != null && (
                    <FontAwesomeIcon icon={icon} size="lg" />
                )}
                {unsaved && "SAVING..."}
                {this.props.onCommentClick && this.props.signOff != null && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(this.buildComments())
                        }
                        className={`table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        }`}
                    >
                        <FontAwesomeIcon icon={faComments} size="lg" />
                    </div>
                )}
            </td>
        );
    }

     /**
      * This non-standard complicated double click detection is there because
      * at the time of writing, Safari on iOS (and also Chrome on the same) did
      * not support the ondblclick event, and hence React's onDoubleClick didn't work.
      */
    private onClick() {
        const { onClick, disabled } = this.props;
        const time  = (new Date()).getTime();
        if (!disabled && onClick != null && (time - this.lastClick) < 300) {
            onClick();
        }
        this.lastClick = time;
    }

    private buildComments() {
        const { participant, group, signOff, assignment } = this.props;

        if (signOff == null) {
            return centerSpinner();
        } else {
            return (
                <div>
                    <h4>Sign-off details:</h4>
                    <SignOffDetails participantId={participant.id} assignmentId={assignment.id} />
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

export default connect(
    (state: ApplicationState) => ({
        commentThread: (entityId: number, entityType: EntityType) =>
            getCommentThread(state, entityId, entityType),
    }),
    {},
)(SignoffResultTableCell);
