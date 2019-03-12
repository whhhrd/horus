import React, { Component } from "react";

import { SignOffChangeResult } from "../../../state/sign-off/types";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SignoffResultTableCellProps {
    signOffState: SignOffChangeResult;
    unsaved: boolean;
    disabled: boolean;
    onClick?: () => void;
}

export default class SignoffResultTableCell extends Component<
    SignoffResultTableCellProps
> {
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
                onDoubleClick={() => this.onClick()}
                style={{ cursor: disabled ? "default" : "pointer" }}
            >
                {!unsaved && icon != null && <FontAwesomeIcon icon={icon} size="lg"/>}
                {unsaved && "SAVING..."}
            </td>
        );
    }

    private onClick() {
        const { onClick, disabled } = this.props;

        if (!disabled && onClick != null) {
            onClick();
        }
    }
}
