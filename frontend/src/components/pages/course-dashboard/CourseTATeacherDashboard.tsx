import React, { Component } from "react";
import { CourseDtoFull, AssignmentSetDtoBrief } from "../../../api/types";
import Row from "reactstrap/lib/Row";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import CanvasCard from "../../CanvasCard";
import { Col, Alert } from "reactstrap";
import { buildContent } from "../../pagebuilder";

interface CourseTATeacherDashboardProps {
    course: CourseDtoFull;
}

export default class CourseTATeacherDashboard extends Component<CourseTATeacherDashboardProps> {
    render() {
        return buildContent(this.props.course.name, this.buildContent());
    }
    private buildContent() {
        return (
            <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                {this.props.course.assignmentSets.length > 0 ?
                    this.props.course.assignmentSets.map((aSet: AssignmentSetDtoBrief) => {
                        return <CanvasCard
                            watermarkIcon={faTasks}
                            key={aSet.id}
                            cardTitle={aSet.name}
                            url={`/courses/${this.props.course.id}/assignmentsets/${aSet.id}`} />;
                    }) :
                    <Col xs="12" lg="3">
                        <Alert className="text-center" color="info">Nothing to display here.</Alert>
                    </Col>}
            </Row>
        );
    }
}
