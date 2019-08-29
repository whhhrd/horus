import { PureComponent } from "react";
import React from "react";
import { Badge } from "reactstrap";
import { LabelDto } from "../api/types";

interface LabelProps {
    label: LabelDto;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Displays a label-like component, which color and content
 * are based on the given label object.
 */
export default class Label extends PureComponent<LabelProps> {

    /**
     * Determines whether the text-color of the label should
     * be black or white, based on the backgroundcolor of the label.
     * Inspiration from https://stackoverflow.com/a/1855903/7133329.
     * @param labelColor The color of the label in hex format.
     */
    static textColor(labelColor: string) {
        const red = parseInt(labelColor.substring(0, 2), 16);
        const green = parseInt(labelColor.substring(2, 4), 16);
        const blue = parseInt(labelColor.substring(4, 6), 16);

        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255.0;

        return luminance < 0.5 ? "#FFFFFF" : "#000000";
    }

    render() {
        const { name, color } = this.props.label;
        const { className, style } = this.props;
        return (
            <Badge
                pill
                className={`p-label mr-1 mb-1 py-1 px-2 shadow-sm ${
                    className != null ? className : ""
                }`}
                style={{ ...this.getLabelStyle(color), ...style }}
            >
                {name}
                {this.props.children}
            </Badge>
        );
    }

    getLabelStyle(labelColor: string) {
        const color = Label.textColor(labelColor);
        return { backgroundColor: `#${labelColor}`, color };
    }
}
