import { Component } from "react";
import React from "react";
import { Card, CardHeader, CardBody, CardTitle } from "reactstrap";
import { randomColor } from "./util";
import { push } from "connected-react-router";
import { connect } from "react-redux";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CanvasCardProps {
    cardTitle: string;
    url: string;
    redirectTo: (url: string) => {};
    watermarkIcon: IconDefinition | null;
}

class CanvasCard extends Component<CanvasCardProps> {
    render() {
        const { url, cardTitle } = this.props;
        return (
            <Card className="canvas-card" onClick={() => this.props.redirectTo(url)}>
                <CardHeader
                    className="canvas-card-header d-flex vertical-center"
                    style={{ backgroundColor: randomColor(cardTitle) }}>
                    <div className="mx-auto my-auto text-center">
                        {this.props.watermarkIcon != null ?
                            <FontAwesomeIcon icon={this.props.watermarkIcon}
                                size="5x"
                                className="watermark-icon" /> : null}
                    </div>
                </CardHeader>
                <CardBody className="py-3">
                    <CardTitle>
                        {cardTitle}
                    </CardTitle>
                </CardBody>
            </Card>
        );
    }
}

export default connect(() => ({}), {
    redirectTo: (url: string) => push(url),
})(CanvasCard);