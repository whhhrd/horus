import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { Col, Alert, Button, Row } from "reactstrap";

import {
    CourseDtoFull,
    AssignmentSetDtoBrief,
    RoomDto,
} from "../../../api/types";
import { ApplicationState } from "../../../state/state";
import { getRooms } from "../../../state/rooms/selectors";
import {
    roomsFetchRequestedAction,
    RoomsFetchRequestedAction,
} from "../../../state/rooms/action";

import { faTasks, faStoreAlt } from "@fortawesome/free-solid-svg-icons";
import CanvasCard from "../../CanvasCard";
import { buildContent } from "../../pagebuilder";

interface CourseTATeacherDashboardProps {
    course: CourseDtoFull;
    rooms: RoomDto[] | null;
    fetchRooms: (courseId: number) => RoomsFetchRequestedAction;
}

/**
 * An overview for teaching staff that displays quick access
 * options for open rooms and progress overviews of assignment sets.
 */
class CourseTATeacherDashboard extends Component<
    CourseTATeacherDashboardProps
> {
    componentDidMount() {
        this.props.fetchRooms(this.props.course.id);
    }

    render() {
        return buildContent(this.props.course.name, this.buildContent());
    }

    private buildContent() {
        const { rooms } = this.props;
        return (
            <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                <Link to={`/courses/${this.props.course.id}/signoff`}>
                    <Button
                        color="success"
                        size="lg"
                        style={{ minWidth: "260px", minHeight: "70px" }}
                        className="w-100 d-xs-block d-lg-none mt-3 mb-3"
                    >
                        <span style={{ fontSize: "16pt" }}>
                            Go to sign-off mode
                        </span>
                    </Button>
                </Link>
                {rooms != null && rooms.length > 0 && (
                    <Fragment>
                        <h4 className="d-xs-block d-lg-none border-top pt-3 w-100 text-center">
                            Open rooms
                        </h4>
                        <h4 className="d-none d-lg-block w-100 px-2">
                            Open rooms
                        </h4>
                        {rooms.map((r) => (
                            <CanvasCard
                                cardTitle={r.name}
                                url={`/courses/${this.props.course.id}/rooms/${
                                    r.code
                                }`}
                                key={r.code}
                                watermarkIcon={faStoreAlt}
                            />
                        ))}
                    </Fragment>
                )}
                <h4 className="d-xs-block d-lg-none border-top mt-2 pt-3 w-100 text-center">
                    General overviews
                </h4>
                <h4 className="d-none d-lg-block w-100 px-2">
                    General overviews
                </h4>
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

export default connect(
    (state: ApplicationState) => ({
        rooms: getRooms(state),
    }),
    {
        fetchRooms: roomsFetchRequestedAction,
    },
)(CourseTATeacherDashboard);
