import React, { Component } from "react";
import { gradientColor } from "../../util";

interface ProgressTableCellProps {
    style: React.CSSProperties;
    className: string;

    progress: number;
}

export default class ProgressTableCell extends Component<ProgressTableCellProps> {
    render() {
        const {style, progress} = this.props;
        return (
            <div
                className={this.props.className + " d-flex align-items-center justify-content-center"}
                style={{...style, ...gradientColor(progress)}}
            >
                <span>{String(Math.floor(progress)) + "%"}</span>
            </div>
        );
    }
}
