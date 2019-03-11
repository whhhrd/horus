import React, { Component } from "react";

import { SignOffChangeResult } from "../../../state/sign-off/types";

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
        switch (signOffState) {
            case SignOffChangeResult.Sufficient:
                className = "sign-off-table-cell-complete";
                break;
            case SignOffChangeResult.Insufficient:
                className = "sign-off-table-cell-insufficient";
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
