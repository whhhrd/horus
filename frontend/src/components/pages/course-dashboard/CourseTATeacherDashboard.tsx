import React, { Component } from "react";
import { CourseDtoFull, AssignmentSetDtoBrief } from "../../../api/types";
import Row from "reactstrap/lib/Row";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import CanvasCard from "../../CanvasCard";
import { Col, Alert, Button } from "reactstrap";
import { buildContent } from "../../pagebuilder";
import { Link } from "react-router-dom";

interface CourseTATeacherDashboardProps {
    course: CourseDtoFull;
}

export default class CourseTATeacherDashboard extends Component<
    CourseTATeacherDashboardProps
> {
    render() {
        return buildContent(this.props.course.name, this.buildContent());
    }
    private buildContent() {
        return (
            <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                <Link to={`/courses/${this.props.course.id}/signoff`}>
                    <Button
                        color="success"
                        size="lg"
                        style={{ minWidth: "260px", minHeight: "70px"}}
                        className="w-100 d-xs-block d-lg-none mt-3 mb-4"
                    >
                        <span style={{fontSize: "16pt"}}>Go to sign-off mode</span>
                    </Button>
                </Link>
                <h4 className="d-xs-block d-lg-none border-top pt-4 w-100 text-center">General overviews</h4>
                <h4 className="d-none d-lg-block w-100 px-2">General overviews</h4>
                {this.props.course.assignmentSets.length > 0 ? (
                    this.props.course.assignmentSets.map(
                        (aSet: AssignmentSetDtoBrief) => {
                            return (
                                <CanvasCard
                                    watermarkIcon={faTasks}
                                    key={aSet.id}
                                    cardTitle={aSet.name}
                                    url={`/courses/${
                                        this.props.course.id
                                    }/assignmentsets/${aSet.id}`}
                                />
                            );
                        },
                    )
                ) : (
                    <Col xs="12" lg="3">
                        <Alert className="text-center" color="info">
                            Nothing to display here.
                        </Alert>
                    </Col>
                )}
            </Row>
        );
    }
}
