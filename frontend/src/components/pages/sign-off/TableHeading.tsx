import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

interface TableHeadingProps {
    text: string;
    onCommentClick?: () => any;
}

export default class TableHeading extends Component<TableHeadingProps> {
    render() {
        return (
            <th className="sign-off-table-heading">
                {this.props.text}
                {this.props.onCommentClick && <div onClick={this.props.onCommentClick} style={{ float: "right" }}>
                    <FontAwesomeIcon icon={faEllipsisH} />
                </div>}
            </th>
        );
    }
}
