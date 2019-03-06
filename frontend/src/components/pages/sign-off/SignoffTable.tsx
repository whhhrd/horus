import {
    SignOffResultDtoCompact,
    GroupDtoFull,
    AssignmentSetDtoFull,
    ParticipantDto,
    AssignmentDtoBrief,
} from "../../../state/types";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import TableHeading from "./TableHeading";
import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import {
    signOffResultsRequestedAction,
    changeLocalSignoffAction,
    signOffSaveRequestedAction,
} from "../../../state/sign-off/actions";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import {
    getRemoteSignoffs,
    getGroup,
    getAssignmentSet,
    getLocalChanges,
    isSaving,
} from "../../../state/sign-off/selectors";
import queryString from "query-string";
import Spinner from "reactstrap/lib/Spinner";
import Container from "reactstrap/lib/Container";
import TableEntry from "./TableEntry";
import { SignOff, SignOffChange } from "../../../state/sign-off/types";
import Button from "reactstrap/lib/Button";
import { Table } from "reactstrap";

interface SignoffTableProps {
    remoteSignoffs?: SignOffResultDtoCompact[];
    requestSignOffs: (asid: number, cid: number, gid: number) => {
        type: string,
    };
    localSignOff: (aid: number, pid: number, signOff: SignOff) => {
        type: string;
    };
    group?: GroupDtoFull;
    assignmentSet?: AssignmentSetDtoFull;
    localChanges?: SignOffChange[];
    saving: boolean;
    saveChanges: (localChanges: SignOffChange[], asid: number) => {
        type: string;
    };
}

class SignoffTable extends Component<SignoffTableProps & RouteComponentProps<any>> {

    private static nextSignOffState(signOff: SignOff) {
        switch (signOff) {
            case SignOff.Complete:
                return SignOff.Incomplete;
            case SignOff.Incomplete:
                return SignOff.Unattempted;
            case SignOff.Unattempted:
                return SignOff.Complete;
        }
    }

    componentDidMount() {
        // TODO check correct query parameter
        this.props.requestSignOffs(this.props.match.params.asid,
            this.props.match.params.cid,
            parseInt(queryString.parse(location.search).g! as string, 10));
    }

    render() {
        if (this.props.remoteSignoffs === undefined) {
            return <Spinner type="grow" />;
        }
        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Signoff</h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2 flex-row justify-content-center">
                    <Col className="col-md-6 col-xs-12">
                        <Button block size="lg"
                            color="primary"
                            className="mb-3"
                            onClick={() => this.props.saveChanges(this.props.localChanges!,
                                this.props.match.params.asid)}>
                            Save changes
                            </Button>
                        {this.props.saving && <Spinner />}
                        <Table className="table-bordered sign-off-table">
                            <thead className="thead-light">
                                <tr>
                                    <TableHeading text={this.props.group!.name}
                                        onCommentClick={() => alert("test")} />
                                    {this.props.group!.participants.map((participant: ParticipantDto) => {
                                        return <TableHeading key={participant.id}
                                            text={participant.person.shortName} />;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.assignmentSet!.assignments.map((assignment: AssignmentDtoBrief) => {
                                    return <tr key={assignment.id}>
                                        <TableHeading text={assignment.name} onCommentClick={() => alert("test")} />
                                        {this.props.group!.participants.map((participant: ParticipantDto) => {
                                            switch (this.getCellType(participant, assignment)) {
                                                case SignOff.Complete:
                                                    return <TableEntry key={participant.id}
                                                        signOffState={SignOff.Complete}
                                                        onClick={
                                                            () => this.props.localSignOff(assignment.id,
                                                                participant.id,
                                                                SignoffTable.nextSignOffState(SignOff.Complete))} />;
                                                case SignOff.Incomplete:
                                                    return <TableEntry key={participant.id}
                                                        signOffState={SignOff.Incomplete}
                                                        onClick={
                                                            () => this.props.localSignOff(assignment.id,
                                                                participant.id,
                                                                SignoffTable.nextSignOffState(SignOff.Incomplete))} />;
                                                case SignOff.Unattempted:
                                                    return <TableEntry key={participant.id}
                                                        onClick={
                                                            () => this.props.localSignOff(assignment.id,
                                                                participant.id,
                                                                SignoffTable.nextSignOffState(SignOff.Unattempted))} />;
                                            }
                                        })}
                                    </tr>;
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        );
    }

    private getCellType(participant: ParticipantDto, assignment: AssignmentDtoBrief) {
        const localChange = this.props.localChanges!.find((change: SignOffChange) => (
            change.aid === assignment.id && change.pid === participant.id
        ));
        if (localChange !== undefined) {
            return localChange.result;
        }
        const remoteSignoff = this.props.remoteSignoffs!.find((signOff: SignOffResultDtoCompact) => (
            signOff.assignmentId === assignment.id && signOff.participantId === participant.id
        ));
        if (remoteSignoff === undefined) {
            return SignOff.Unattempted;
        }
        switch (remoteSignoff.result) {
            case "COMPLETE":
                return SignOff.Complete;
            case "INSUFFICIENT":
                return SignOff.Incomplete;
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    remoteSignoffs: getRemoteSignoffs(state),
    group: getGroup(state),
    assignmentSet: getAssignmentSet(state),
    localChanges: getLocalChanges(state),
    saving: isSaving(state),
}), {
        requestSignOffs: signOffResultsRequestedAction,
        localSignOff: changeLocalSignoffAction,
        saveChanges: signOffSaveRequestedAction,
    })(SignoffTable));
