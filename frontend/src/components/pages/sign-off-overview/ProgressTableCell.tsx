import React, { Component } from "react";

const progressGradient = ["#F8D7DA", "#F8D9D8", "#F9DCD7", "#FADFD6",
                          "#FAE2D4", "#FBE5D3", "#FCE7D2", "#FCEAD0",
                          "#FDEDCF", "#FEF0CE", "#FFF3CD", "#FAF2CE",
                          "#F6F1CF", "#F2F1D0", "#EDF0D2", "#E9F0D3",
                          "#E5EFD4", "#E0EED6", "#DCEED7", "#D8EDD8",
                          "#D4EDDA"];
const progressBorderGradient = ["#DC3545", "#DF433E", "#E35138", "#E65F32",
                                "#EA6D2C", "#ED7B26", "#F1891F", "#F49719",
                                "#F8A513", "#FBB30D", "#FFC107", "#E9BE0D",
                                "#D4BB13", "#BEB919", "#A9B61F", "#93B426",
                                "#7EB12C", "#68AE32", "#53AC38", "#3DA93E",
                                "#28A745"];
const progressTextGradient = ["#721C24", "#732320", "#752A1D", "#77311A",
                              "#793817", "#7B4014", "#7D4710", "#7F4E0D",
                              "#81550A", "#835C07", "#856404", "#796207",
                              "#6E610A", "#63600D", "#585E10", "#4D5D14",
                              "#415C17", "#365A1A", "#2B591D", "#205820",
                              "#155724"];

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
                style={{...style, ...this.cellColor()}}
            >
                <span>{String(Math.floor(progress)) + "%"}</span>
            </div>
        );
    }

    cellColor() {
        const {progress} = this.props;
        const colorIndex = Math.floor(progress / 100 * (progressGradient.length - 1));
        const backgroundColor = progressGradient[colorIndex];
        const borderColor = progressBorderGradient[colorIndex];
        const color = progressTextGradient[colorIndex];

        return {backgroundColor, borderColor, color};
    }
}
