import { PureComponent } from "react";
import React from "react";
import { Badge } from "reactstrap";
import { LabelDto } from "../api/types";

interface LabelProps {
    label: LabelDto;
    className?: string;
    style?: React.CSSProperties;
}

export default class Label extends PureComponent<LabelProps> {
    render() {
        const { name, color } = this.props.label;
        const { className, style } = this.props;
        return (
            <Badge
                pill
                className={`p-label mr-1 mb-1 py-1 px-2 shadow-sm ${className != null ? className : ""}`}
                style={{...this.getLabelStyle(color), ...style}}
            >
                {name}
                {this.props.children}
            </Badge>
        );
    }

    getLabelStyle(labelColor: string) {
        const color = this.textColor(labelColor);
        return { backgroundColor: `#${labelColor}`, color };
    }

    textColor(labelColor: string) {
        let color = "#000000";

        const red = parseInt(labelColor.substring(0, 2), 16);
        const green = parseInt(labelColor.substring(2, 4), 16);
        const blue = parseInt(labelColor.substring(4, 6), 16);

        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255.0;

        if (luminance < 0.5) {
            color = "#FFFFFF";
        }

        return color;
    }
}
