import { Component } from "react";
import React from "react";
import { Card, CardHeader, CardBody, CardTitle } from "reactstrap";
import { randomColor } from "./util";
import { push } from "connected-react-router";
import { connect } from "react-redux";

interface CanvasCardProps {
    cardTitle: string;
    url: string;
    redirectTo: (url: string) => {};
}

class CanvasCard extends Component<CanvasCardProps> {
    render() {
        const { url, cardTitle } = this.props;
        return (
            <Card className="canvas-card" onClick={() => this.props.redirectTo(url)}>
                <CardHeader
                    className="canvas-card-header"
                    style={{ backgroundColor: randomColor(cardTitle) }}>
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

export default connect( () => ({}), {
    redirectTo: (url: string) => push(url),
})(CanvasCard);