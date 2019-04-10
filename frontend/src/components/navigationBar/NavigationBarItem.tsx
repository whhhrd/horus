import React, { Component } from "react";
import { Link } from "react-router-dom";

import { ListGroupItem } from "reactstrap";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavigationBarItemProps {
    id?: string;
    active: boolean;
    icon: IconDefinition;
    title: string;
    url: string;
    onClick?: () => {};
}

/**
 * A button that is displayed in the navigation bar.
 */
export class NavigationBarItem extends Component<NavigationBarItemProps> {
    render() {
        const classes =
            "navigation-bar-item-link border-bottom" +
            (this.props.active ? " navigation-bar-item-link-active" : "");

        const id = this.props.id != null ? this.props.id : undefined;

        return (
            <Link
                id={id}
                onClick={this.props.onClick}
                to={this.props.url}
                className={classes}
            >
                <ListGroupItem className="text-center bg-light w-100 px-0">
                    <FontAwesomeIcon icon={this.props.icon} size="2x" /> <br />
                    <span className="navigation-bar-item-text">
                        {this.props.title}
                    </span>
                </ListGroupItem>
            </Link>
        );
    }
}
