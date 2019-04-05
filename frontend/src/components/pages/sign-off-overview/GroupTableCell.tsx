import React, { Component } from "react";

import { GroupDtoFull, CommentThreadDtoFull } from "../../../api/types";
import CommentThread from "../../comments/CommentThread";
import { EntityType } from "../../../state/comments/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { getCommentThread } from "../../../state/comments/selectors";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";

interface GroupTableCellProps {
    style: React.CSSProperties;
    className: string;
    group: GroupDtoFull;
    onCommentClick: (comments: JSX.Element) => void;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class GroupTableCell extends Component<GroupTableCellProps> {
    render() {
        const { name } = this.props.group;
        return (
            <div
                className={
                    this.props.className +
                    "d-flex flex-row justify-content-between"
                }
                style={{ ...this.props.style, direction: "rtl" }}
            >
                {this.props.onCommentClick && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(this.buildComments())
                        }
                        className={`overview-table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        }`}
                    >
                        <FontAwesomeIcon icon={faComments} size="sm" />
                    </div>
                )}
                <div title={name} className="ellipsis text-left pl-1 pr-1">
                    {name}
                </div>
            </div>
        );
    }

    private buildComments() {
        const { group } = this.props;
        return (
            <div>
                <h4>Comments:</h4>
                <CommentThread
                    commentThreadId={
                        group.commentThread != null
                            ? group.commentThread.id
                            : null
                    }
                    commentThreadSubject={group.name}
                    entityId={group.id}
                    entityType={EntityType.Group}
                    commentThreadOpen={true}
                />
            </div>
        );
    }

    private highlightIcon() {
        const { group, commentThread } = this.props;
        return (
            commentThread(group.id, EntityType.Group) != null ||
            group.commentThread != null
        );
    }
}

export default connect(
    (state: ApplicationState) => ({
        commentThread: (entityId: number, entityType: EntityType) =>
            getCommentThread(state, entityId, entityType),
    }),
    {},
)(GroupTableCell);
