import React, { Component } from "react";
import {
    CourseDtoFull,
    AssignmentSetDtoFull,
    AssignmentDtoBrief,
    StudentDashboardDto,
    SignOffResultDtoStudent,
    GroupDtoFull,
    ParticipantDtoBrief,
    AssignmentSetDtoBrief,
} from "../../../api/types";
import { connect } from "react-redux";
import { getStudentDashboardData } from "../../../state/student-dashboard/selectors";
import { ApplicationState } from "../../../state/state";
import {
    studentDashboardDataRequestedAction,
    StudentDashboardDataRequestedAction,
} from "../../../state/student-dashboard/actions";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { buildContent } from "../../pagebuilder";
import {
    UncontrolledTooltip,
    ListGroup,
    ListGroupItem,
    ListGroupItemHeading,
    Table,
    Row,
} from "reactstrap";
import Col from "reactstrap/lib/Col";
import { getDisplayedDate } from "../../util";

interface CourseStudentDashboardProps {
    course: CourseDtoFull;
    dashboard: StudentDashboardDto | null;
    requestDashboardData: (cid: number) => StudentDashboardDataRequestedAction;
}
export class CourseStudentDashboard extends Component<CourseStudentDashboardProps> {
    scrollToAssignment: Map<number, HTMLTableDataCellElement>;
    constructor(props: CourseStudentDashboardProps) {
        super(props);
        this.scrollToAssignment = new Map<number, HTMLTableDataCellElement>();
    }
    componentDidMount() {
        this.props.requestDashboardData(this.props.course.id);
    }
    componentDidUpdate() {
        for (const el of this.scrollToAssignment.values()) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }
    render() {
        return buildContent(this.props.course.name, this.buildContent());
    }
    private buildContent() {
        if (this.props.dashboard == null) {
            return null;
        }
        return (
            <div className="px-2 justify-content-center justify-content-lg-start">
                <Row style={{ display: "block" }}>
                    <h3>Your Progress</h3>
                    {this.buildResultsTable()}
                </Row>
                <Row>
                    <Col>
                        <h3>Your Groups</h3>
                        {this.buildGroupsList()}
                    </Col>
                    <Col>
                        <h3>Recent events</h3>
                        {this.buildRecentEvents()}
                    </Col>
                </Row>
            </div>

        );
    }
    private buildResultsTable() {
        return this.props.dashboard!.assignmentSets.map((assignmentSet: AssignmentSetDtoFull) => (
            <div style={{ display: "block", width: "calc(100vw - 110px)" /*<-- Needs change*/, overflowX: "scroll" }}>
                <Table className="sign-off-table table-bordered" style={{
                    tableLayout: "fixed", width: "auto",
                    marginBottom: "0px", marginTop: "16px",
                }}>
                    <tbody>
                        <tr className="sign-off-table-row">
                            <th rowSpan={2} className="sign-off-table-heading sign-off-table-left-column"
                                style={{ minWidth: "150px", left: "-2px" }}>
                                {assignmentSet.name}
                            </th>
                            {assignmentSet.assignments.map((assignment: AssignmentDtoBrief) => (
                                <td className="sign-off-table-heading" style={{ minWidth: "100px", height: "49px" }}>
                                    {assignment.name}
                                </td>
                            ))}
                        </tr>
                        <tr className="sign-off-table-row">
                            {assignmentSet.assignments.map((assignment: AssignmentDtoBrief) => (
                                this.buildTableCell(assignment, assignmentSet.id)
                            ))}
                        </tr>
                    </tbody>
                </Table>
            </div>
        ),
        );
    }
    private buildTableCell(assignment: AssignmentDtoBrief, asid: number): JSX.Element {
        const result = this.props.dashboard!.results.find((signOff: SignOffResultDtoStudent) => (
            signOff.assignmentId === assignment.id
        ));
        if (result == null) {
            return <td className="sign-off-table-cell-blank" style={{ minWidth: "100px", height: "49px" }}
                ref={(ref) => this.setRefIfFirst(asid, ref)} />;
        }
        return (<td id={`a${String(assignment.id)}`} className={`sign-off-table-cell-${
            result.result === "INSUFFICIENT" ? "insufficient" : "complete"}`}
            style={{ minWidth: "100px", height: "49px" }}
            ref={result.result === "INSUFFICIENT" ? (ref) => this.setRefIfFirst(asid, ref) : undefined}>
            <FontAwesomeIcon icon={result.result === "INSUFFICIENT" ? faTimes : faCheck} />
            <UncontrolledTooltip target={`a${String(assignment.id)}`} placement="bottom"
                delay={{ show: 250, hide: 0 }}>
                By: {result.signerName} <br />
                {getDisplayedDate(new Date(result.signedAt))}
            </UncontrolledTooltip>
        </td>);
    }
    private buildGroupsList() {
        return (<ListGroup>
            {this.props.dashboard!.groups.map((group: GroupDtoFull) => (
                <ListGroupItem>
                    <ListGroupItemHeading>
                        {group.name}
                    </ListGroupItemHeading>
                    <ListGroup>
                        {group.participants.map((participant: ParticipantDtoBrief) => (
                            <ListGroupItem>
                                {participant.person.fullName}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </ListGroupItem>
            ))}
        </ListGroup>

        );
    }
    // This may need to be rewritten for efficiency
    private buildRecentEvents() {
        return (<ListGroup>
            {this.props.dashboard!.results.sort((result1: SignOffResultDtoStudent, result2: SignOffResultDtoStudent) =>
                result2.signedAt.valueOf() - result1.signedAt.valueOf()).slice(0, 5).map((
                    result: SignOffResultDtoStudent) => (
                        <ListGroupItem>
                            {`${getDisplayedDate(new Date(result.signedAt))}: ${result.signerName} ${
                                result.result === "INSUFFICIENT" ? "requested changes for" : "signed you off for"}
                                ${(this.props.dashboard!.assignmentSets.reduce((prev: AssignmentDtoBrief[],
                                                                                curr: AssignmentSetDtoFull) =>
                                    (prev.concat(curr.assignments)), []).find(
                                        (assignment: AssignmentSetDtoBrief) => assignment.id === result.assignmentId,
                                    ))!.name} in ${this.props.dashboard!.assignmentSets.find(
                                        (assignmentSet: AssignmentSetDtoFull) => assignmentSet.assignments.some(
                                            (assignment: AssignmentDtoBrief) => assignment.id === result.assignmentId),
                                    )!.name}
                                `}
                        </ListGroupItem>
                    ),
                )}
        </ListGroup>);
    }
    private setRefIfFirst(asid: number, el: HTMLTableDataCellElement | null) {
        if (el != null && !this.scrollToAssignment.has(asid)) {
            this.scrollToAssignment.set(asid, el);
        }
    }
}
export default connect((state: ApplicationState) => ({
    dashboard: getStudentDashboardData(state),
}), {
        requestDashboardData: (cid: number) => studentDashboardDataRequestedAction(cid),
    })(CourseStudentDashboard);
