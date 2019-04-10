import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Card, CardHeader, CardBody, CardTitle } from "reactstrap";

import { randomColor } from "./util";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CanvasCardProps {
    cardTitle: string;
    url: string;
    watermarkIcon: IconDefinition | null;
    clickable?: boolean;
}

/**
 * A component that renders a card that represents something similar to the
 * Cards used in Canvas. Intended to give the user a familiar feeling.
 * If a URL is provided and the card is specified to be clickable, the card
 * will redirect the user to a certain page when clicked.
 */
class CanvasCard extends Component<CanvasCardProps & RouteComponentProps<any>> {
    static defaultProps = { clickable: true };

    render() {
        const { url, cardTitle, clickable } = this.props;
        return (
            <Card
                className={`canvas-card mx-2 mb-3 shadow-sm ${
                    clickable ? "" : "canvas-card-unclickable"
                }`}
                onClick={clickable ? () => this.goToCourse(url) : () => null}
            >
                <CardHeader
                    className="canvas-card-header d-flex vertical-center"
                    style={{ backgroundColor: randomColor(cardTitle) }}
                >
                    <div className="mx-auto my-auto text-center">
                        {this.props.watermarkIcon != null ? (
                            <FontAwesomeIcon
                                icon={this.props.watermarkIcon}
                                size="5x"
                                className="watermark-icon"
                            />
                        ) : null}
                    </div>
                </CardHeader>
                <CardBody className="py-3">
                    <CardTitle>{cardTitle}</CardTitle>
                </CardBody>
            </Card>
        );
    }

    /**
     * Redirects the user to the specified URL.
     */
    goToCourse(url: string) {
        this.props.history.push({
            pathname: url,
        });
    }
}

export default withRouter(
    connect(
        () => ({}),
        {},
    )(CanvasCard),
);
