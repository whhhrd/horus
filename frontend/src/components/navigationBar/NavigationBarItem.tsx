import { Component } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import ListGroupItem from "reactstrap/lib/ListGroupItem";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

interface NavigationBarItemProps {
    active: boolean;
    icon: IconDefinition;
    title: string;
    url: string;
    onClick?: () => {};
}

export class NavigationBarItem extends Component<NavigationBarItemProps> {
    render() {
        const classes = "navigation-bar-item-link border-bottom" +
            (this.props.active ? " navigation-bar-item-link-active" : "");

        return (
            <Link onClick={this.props.onClick} to={this.props.url} className={classes}>
                <ListGroupItem className="text-center bg-light w-100 px-0">

                    <FontAwesomeIcon icon={this.props.icon} size="2x" /> <br />
                    <span className="navigation-bar-item-text">{this.props.title}</span>

                </ListGroupItem >
            </Link>

        );
    }
}
