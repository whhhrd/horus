import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import { SignOff } from "../../../state/sign-off/types";

interface TableEntryProps {
    signOffState: SignOff;
    unsafed: boolean;
    onCommentClick?: () => any;
    onClick?: () => any;
}

export default class TableEntry extends Component<TableEntryProps> {
    static defaultProps = {
        unsafed: false,
        signOffState: SignOff.Unattempted,
    };
    render() {
        const classes = `cursor-pointer text-center sign-off-table-entry ${this.signOffBackgroundColor()}
        ${this.props.unsafed ? "sign-off-table-cell-unsafed" : ""}`;
        return (
            <td className={classes} onClick={() => this.props.onClick!()}>
                {this.signOffIcon()}
                {this.props.onCommentClick && <div onClick={this.props.onCommentClick}
                    className="sign-off-table-entry-enabled"
                    style={{ float: "right", borderLeftWidth: "0px" }}>
                    <FontAwesomeIcon icon={faEllipsisH} />
                </div>}
            </td>
        );
    }
    private signOffIcon = () => {
        switch (this.props.signOffState) {
            case SignOff.Complete:
                return <FontAwesomeIcon icon={faCheck} />;
            case SignOff.Incomplete:
                return <FontAwesomeIcon icon={faMinus} />;
            case SignOff.Unattempted:
                return null;
        }
    }
    private signOffBackgroundColor = () => {
        switch (this.props.signOffState) {
            case SignOff.Complete:
                return "table-success";
            case SignOff.Incomplete:
                return "table-warning";
            case SignOff.Unattempted:
                return "#f7f7f7";

        }
    }
}
