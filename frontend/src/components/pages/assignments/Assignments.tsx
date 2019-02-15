import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Container, Row, Alert, Spinner, Col } from "reactstrap";

import AssignmentSetListEntry from "./AssignmentSetListEntry";

import { getError, getAssignmentGroupSetsMappingDtos, getAssignmentSetDtoBriefs }
    from "../../../state/courses/assignments/selectors";
import { assignmentGroupSetsMappingDtoFetchRequestedAction, assignmentSetDtoBriefsFetchRequestedAction }
    from "../../../state/courses/assignments/actions";

import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto, GroupSetDtoBrief }
    from "../../../state/types";
import { ApplicationState } from "../../../state/state";

interface AssignmentsProps {

    assignmentSetDtoBriefs: AssignmentSetDtoBrief[] | null,
    assignmentGroupSetsMappingDtos: AssignmentGroupSetsMappingDto[] | null,
    error: Error | null,

    fetchAssignmentGroupSetsMappingDtos: (courseID: number) => {
        type: string
    },

    fetchAssignmentSetDtoBriefs: (courseID: number) => {
        type: string
    },
}

interface AssignmentsState { }

class Assignments extends Component<AssignmentsProps & RouteComponentProps<any>, AssignmentsState> {

    /**
     * Prepares the mapping between AssignmentSets and GroupSets. Generates a Map with as key
     * an assignmentSetID and as value a list of GroupSetDtoBrief objects. 
     * @param mappingDtos The Dtos fetched from the API call /courses/:cid/assignmentgroupsetsmappings
     */
    private prepareAssignmentGroupSetsMappingDtosToMap(mappingDtos: AssignmentGroupSetsMappingDto[]) {

        // The prepared mapping to be returned.
        let aSetIDsToGroupSets = new Map<number, GroupSetDtoBrief[]>();

        // Return an empty map if there are no mappings found
        if (mappingDtos == null) {
            return aSetIDsToGroupSets;
        } else {

            // Else loop over the mappingDtos and fill the map
            for (var mappingDto of mappingDtos) {
                var aSetDtoBrief = mappingDto.assignmentSet;
                var groupSetDtoBrief = mappingDto.groupSet;

                // Put an empty list if there is no key yet for this aSetDtoBrief
                if (aSetIDsToGroupSets.get(aSetDtoBrief.id) === undefined) {
                    aSetIDsToGroupSets.set(aSetDtoBrief.id, []);
                }

                // Push the groupSetDtoBrief to the value of the corresponding key
                aSetIDsToGroupSets.get(aSetDtoBrief.id)!.push(groupSetDtoBrief);
            }
        }

        return aSetIDsToGroupSets;
    }

    /**
     * Creates a list of JSX elements, pushing JSX elements based on the following scenarios:
     * 1. A waiting spinner in case the aSetDtoBriefs is null
     * 2. The actual AssignmentSetListEntry JSX element in case there are assignment sets for this course
     * 3. An Alert displaying that there are no assignment sets for this course if the aSetDtoBriefs is empty
     * @param aSetDtoBriefs The list of AssignmentSetDtoBriefs, necessary for displaying the AssignmentSetListEntry
     * @param preparedASetGroupSetsMapping A Map that maps assignmentSetID to a list of GroupSetDtoBriefs
     */
    private composeAssignmentSetListEntries(aSetDtoBriefs: AssignmentSetDtoBrief[] | null,
        preparedASetGroupSetsMapping: Map<number, GroupSetDtoBrief[]>) {

        // The JSX.Element[] list to be returned
        var aSetJSXs: JSX.Element[] = [];

        // Put entries in the list only if there are assignmentSetDtoBriefs, otherwise put an alert into the list
        if (aSetDtoBriefs == null) {
            aSetJSXs.push(<Spinner key={1} color="primary" size=""></Spinner>)
        } else if (aSetDtoBriefs.length > 0) {
            // Loop over each assignmentSetDtoBrief and put 
            for (var aSetDtoBrief of aSetDtoBriefs) {

                // Retrieve the groupSets mapped to the assignmentSet
                var groupSets = preparedASetGroupSetsMapping.get(aSetDtoBrief.id);

                // Push an AssignmentSetListEntry with the necessary details
                aSetJSXs.push(
                    <AssignmentSetListEntry
                        key={aSetDtoBrief.id}
                        assignmentSet={aSetDtoBrief}
                        groupSets={groupSets != undefined ? groupSets : []}
                    />
                );
            }
        } else {
            // If there are no assignmentSetDtoBriefs, push an Alert saying so
            aSetJSXs.push(<Alert className="mt-3" color="primary">No assignment sets for this course yet.</Alert>);
        }

        return aSetJSXs;
    }


    componentDidMount() {
        // Fetch the AssignmentSetDtoBriefs
        this.props.fetchAssignmentSetDtoBriefs(this.props.match.params.cid);

        // Fetch the AssignmentGroupSets mappings
        this.props.fetchAssignmentGroupSetsMappingDtos(this.props.match.params.cid);
    }

    public render() {
        // If an error occurred, show the error
        if (this.props.error != null) {
            return <Alert key={1} color="danger">Something went wrong. Perhaps the course does not exist.</Alert>
        }

        // Prepare the mapping of assignment set with its groupsets
        const preparedASetGroupSetsMapping: Map<number, GroupSetDtoBrief[]> =
            this.prepareAssignmentGroupSetsMappingDtosToMap(this.props.assignmentGroupSetsMappingDtos!);

        // Put the AssignmentSetListEntry elements in the following map
        const aSetJSXs: JSX.Element[] =
            this.composeAssignmentSetListEntries(this.props.assignmentSetDtoBriefs, preparedASetGroupSetsMapping);

        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Sign-off Lists Manager</h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2">
                    <Col lg="5" xs="12" s="12">
                        <h4>Sign-off Lists</h4>
                        {aSetJSXs}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    assignmentGroupSetsMappingDtos: getAssignmentGroupSetsMappingDtos(state),
    assignmentSetDtoBriefs: getAssignmentSetDtoBriefs(state),
    error: getError(state),
}), {
        fetchAssignmentGroupSetsMappingDtos: assignmentGroupSetsMappingDtoFetchRequestedAction,
        fetchAssignmentSetDtoBriefs: assignmentSetDtoBriefsFetchRequestedAction,
    })(Assignments));
