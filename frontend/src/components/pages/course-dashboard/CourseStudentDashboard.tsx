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
    Table,
    Row,
    Col,
    Button,
    UncontrolledCollapse,
    CardHeader,
    CardTitle,
    CardBody,
    Card,
} from "reactstrap";
import { getDisplayedDate } from "../../util";
import { AutoSizer } from "react-virtualized";

interface CourseStudentDashboardProps {
    course: CourseDtoFull;
    dashboard: StudentDashboardDto | null;
    requestDashboardData: (cid: number) => StudentDashboardDataRequestedAction;
}
export class CourseStudentDashboard extends Component<
    CourseStudentDashboardProps
> {
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
            const scrollContainer = el.parentElement!.parentElement!
                .parentElement!.parentElement!;
            const pixelsToScroll = el.offsetLeft - scrollContainer.parentElement!.offsetWidth / 2;
            scrollContainer.scrollLeft = pixelsToScroll;
        }
    }

    render() {
        return buildContent(this.props.course.name, this.buildContent());
    }

    private buildContent() {
        const { dashboard } = this.props;
        if (dashboard == null) {
            return null;
        } else {
            return (
                <div className="d-flex flex-column align-items-stretch">
                    <h3>Your progress</h3>
                    <div className="d-flex flex-fill flex-column h-100 w-100 mb-2">
                        {this.buildResultsTable(dashboard.assignmentSets)}
                    </div>
                    <Row>
                        <Col xs="12" lg="6" className="mb-3">
                            <h3>Recent events</h3>
                            {this.buildRecentEvents(dashboard.results)}
                        </Col>
                        <Col xs="12" lg="6">
                            <h3>Your groups</h3>
                            {this.buildGroupsList(dashboard.groups)}
                        </Col>
                    </Row>
                </div>
            );
        }
    }
    private buildResultsTable(assignmentSets: AssignmentSetDtoFull[]) {
        if (assignmentSets.length > 0) {
            return assignmentSets.map((assignmentSet: AssignmentSetDtoFull) => (
                <AutoSizer
                    className="mb-3"
                    key={`as-${assignmentSet.id}`}
                    style={{ height: "auto", width: "auto" }}
                >
                    {({ width }) => (
                        <div
                            style={{
                                width,
                                height: "auto",
                                overflow: "auto",
                                display: "block",
                            }}
                        >
                            <Table
                                className="sign-off-table table-bordered m-0"
                                style={{
                                    tableLayout: "fixed",
                                    width: "auto",
                                }}
                            >
                                <tbody>
                                    <tr className="sign-off-table-row">
                                        <th
                                            rowSpan={2}
                                            className="sign-off-table-heading sign-off-table-left-column"
                                            style={{
                                                minWidth: "150px",
                                                left: "0px",
                                            }}
                                        >
                                            {assignmentSet.name}
                                        </th>
                                        {assignmentSet.assignments.map(
                                            (
                                                assignment: AssignmentDtoBrief,
                                            ) => (
                                                <td
                                                    key={assignment.id}
                                                    className="sign-off-table-heading"
                                                >
                                                    {assignment.name}
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                    <tr className="sign-off-table-row">
                                        {assignmentSet.assignments.map(
                                            (assignment: AssignmentDtoBrief) =>
                                                this.buildTableCell(
                                                    assignment,
                                                    assignmentSet.id,
                                                ),
                                        )}
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    )}
                </AutoSizer>
            ));
        } else {
            return (
                <span className="text-muted">
                    You are not assigned to any assignments.
                </span>
            );
        }
    }

    private buildTableCell(
        assignment: AssignmentDtoBrief,
        asid: number,
    ): JSX.Element {
        const result = this.props.dashboard!.results.find(
            (signOff: SignOffResultDtoStudent) =>
                signOff.assignmentId === assignment.id,
        );
        if (result == null) {
            return (
                <td
                    key={assignment.id}
                    className="sign-off-table-cell-blank"
                    style={{ minWidth: "100px", height: "49px" }}
                    ref={(ref) => this.setRefIfFirst(asid, ref)}
                />
            );
        }
        return (
            <td
                key={`res${result.assignmentId}+${result.participantId}+${
                    result.signedAt
                }`}
                id={`a${String(assignment.id)}`}
                className={`sign-off-table-cell-${
                    result.result === "INSUFFICIENT"
                        ? "insufficient"
                        : "complete"
                }`}
                style={{ minWidth: "100px", height: "49px" }}
                ref={
                    result.result === "INSUFFICIENT"
                        ? (ref) => this.setRefIfFirst(asid, ref)
                        : undefined
                }
            >
                <FontAwesomeIcon
                    icon={result.result === "INSUFFICIENT" ? faTimes : faCheck}
                />
                <UncontrolledTooltip
                    target={`a${String(assignment.id)}`}
                    placement="bottom"
                    delay={{ show: 250, hide: 0 }}
                >
                    By: {result.signerName} <br />
                    {getDisplayedDate(new Date(result.signedAt))}
                </UncontrolledTooltip>
            </td>
        );
    }

    private buildGroupsList(groups: GroupDtoFull[]) {
        if (groups.length > 0) {
            return groups.map((group: GroupDtoFull) => (
                <Card key={group.id} className="mb-3">
                    <CardHeader>
                        <CardTitle>
                            {group.name}
                            <Button
                                color="primary"
                                className="float-right"
                                id={`toggle-group-${group.id}`}
                            >
                                Show
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <UncontrolledCollapse toggler={`toggle-group-${group.id}`}>
                        <CardBody>
                            <ul>
                                {group.participants.map(
                                    (participant: ParticipantDtoBrief) => (
                                        <li
                                            key={`p-${participant.id}-g-${
                                                group.id
                                            }`}
                                        >
                                            {participant.person.fullName}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </CardBody>
                    </UncontrolledCollapse>
                </Card>
            ));
        } else {
            return (
                <span className="text-muted">
                    You are not yet in any group.
                </span>
            );
        }
    }

    private buildRecentEvents(results: SignOffResultDtoStudent[]) {
        if (results.length > 0) {
            return (
                <ListGroup>
                    {results
                        .sort(
                            (
                                result1: SignOffResultDtoStudent,
                                result2: SignOffResultDtoStudent,
                            ) =>
                                result2.signedAt.valueOf() -
                                result1.signedAt.valueOf(),
                        )
                        .slice(0, 5)
                        .map((result: SignOffResultDtoStudent) => (
                            <ListGroupItem
                                key={`res${result.assignmentId}+${
                                    result.participantId
                                }+${result.signedAt}`}
                            >
                                <mark>{result.signerName}</mark>{" "}
                                {result.result === "INSUFFICIENT"
                                    ? "requested changes for"
                                    : "signed you off for"}{" "}
                                <mark>
                                    {
                                        this.props
                                            .dashboard!.assignmentSets.reduce(
                                                (
                                                    prev: AssignmentDtoBrief[],
                                                    curr: AssignmentSetDtoFull,
                                                ) =>
                                                    prev.concat(
                                                        curr.assignments,
                                                    ),
                                                [],
                                            )
                                            .find(
                                                (
                                                    assignment: AssignmentSetDtoBrief,
                                                ) =>
                                                    assignment.id ===
                                                    result.assignmentId,
                                            )!.name
                                    }
                                </mark>{" "}
                                {" in "}
                                {
                                    this.props.dashboard!.assignmentSets.find(
                                        (assignmentSet: AssignmentSetDtoFull) =>
                                            assignmentSet.assignments.some(
                                                (
                                                    assignment: AssignmentDtoBrief,
                                                ) =>
                                                    assignment.id ===
                                                    result.assignmentId,
                                            ),
                                    )!.name
                                }{" "}
                                <small className="text-muted">
                                    {getDisplayedDate(
                                        new Date(result.signedAt),
                                    )}
                                </small>
                            </ListGroupItem>
                        ))}
                </ListGroup>
            );
        } else {
            return (
                <span className="text-muted">There are no recent events.</span>
            );
        }
    }

    private setRefIfFirst(asid: number, el: HTMLTableDataCellElement | null) {
        if (el != null && !this.scrollToAssignment.has(asid)) {
            this.scrollToAssignment.set(asid, el);
        }
    }
}
export default connect(
    (state: ApplicationState) => ({
        dashboard: getStudentDashboardData(state),
    }),
    {
        requestDashboardData: (cid: number) =>
            studentDashboardDataRequestedAction(cid),
    },
)(CourseStudentDashboard);
