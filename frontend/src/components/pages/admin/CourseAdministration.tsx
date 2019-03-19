import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";

import { Link } from "react-router-dom";
import { buildContent } from "../../pagebuilder";
import { Row, Col } from "reactstrap";

class CourseAdministration extends PureComponent<RouteComponentProps<any>> {

    render() {
        return buildContent("Course Administration", this.buildContent(), null);
    }

    buildContent() {
        return (
            <Row>
                <Col>
                    <Link
                        to={`/courses/${this.props.match.params.cid}/administration/assignmentsets`}>
                        <h5>Manage Assignment Sets</h5>
                    </Link>
                    <Link
                        to={`/courses/${this.props.match.params.cid}/administration/groupsets`}>
                        <h5>Manage Group Sets</h5>
                    </Link>
                    <Link
                        to={`/courses/${this.props.match.params.cid}/administration/labels`}>
                        <h5>Manage Course Labels</h5>
                    </Link>
                </Col>
            </Row>
        );
    }
}

export default withRouter(connect(null, null)(CourseAdministration));
