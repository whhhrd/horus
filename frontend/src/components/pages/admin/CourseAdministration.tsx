import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";

import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

class CourseAdministration extends PureComponent<RouteComponentProps<any>> {

    render() {
        return (
            <Container fluid>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Course Administration</h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2">
                    <Col>
                        <Link
                            to={`/courses/${this.props.match.params.cid}/administration/assignmentsets`}>
                            <h5>Manage Assignment Sets</h5>
                        </Link>
                        <Link
                            to={`/courses/${this.props.match.params.cid}/administration/groupsets`}>
                            <h5>Manage Group Sets</h5>
                        </Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(connect(null, null)(CourseAdministration));
