import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Card, CardBody, Row } from "reactstrap";

import AssignmentSetListEntry from "./AssignmentSetListEntry";

import {
    getAssignmentGroupSetsMappingDtos,
    getAssignmentSets,
} from "../../../../state/assignments/selectors";

import {
    assignmentGroupSetsMappingsFetchRequestedAction,
    assignmentSetsFetchRequestedAction,
} from "../../../../state/assignments/actions";

import {
    AssignmentSetDtoBrief,
    AssignmentGroupSetsMappingDto,
    GroupSetDtoBrief,
} from "../../../../state/types";

import { ApplicationState } from "../../../../state/state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AssignmentSetCreatorModal from "./AssignmentSetCreatorModal";
import { getCoursePermissions } from "../../../../state/auth/selectors";
import CoursePermissions from "../../../../api/permissions";
import { assignmentSetsAnyEdit, assignmentSetsAnyCreate } from "../../../../state/auth/constants";
import { buildContent } from "../../../pagebuilder";

interface AssignmentSetManagerProps {

    assignmentGroupSetsMappingDtos: AssignmentGroupSetsMappingDto[] | null;

    permissions: CoursePermissions | null;

    getAssignmentSets: () => AssignmentSetDtoBrief[] | null;

    fetchAssignmentGroupSetsMappingDtos: (courseID: number) => {
        type: string,
    };

    fetchAssignmentSets: (courseID: number) => {
        type: string,
    };
}

interface AssignmentSetManagerState {
    creatorModalOpen: boolean;
}

class AssignmentSetManager extends
    Component<AssignmentSetManagerProps & RouteComponentProps<any>, AssignmentSetManagerState> {

    constructor(props: AssignmentSetManagerProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            creatorModalOpen: false,
        };
        this.toggleCreatorModal = this.toggleCreatorModal.bind(this);
    }

    toggleCreatorModal() {
        this.setState((state) => ({ creatorModalOpen: !state.creatorModalOpen }));
    }

    componentDidMount() {
        // Fetch the AssignmentSetDtoBriefs
        this.props.fetchAssignmentSets(this.props.match.params.cid);

        // Fetch the AssignmentGroupSets mappings
        this.props.fetchAssignmentGroupSetsMappingDtos(this.props.match.params.cid);
    }

    render() {
        return buildContent("Assignment Set Manager", this.buildContent());
    }

    buildContent() {
        const assignmentSets = this.props.getAssignmentSets();

        if (assignmentSets === null || this.props.assignmentGroupSetsMappingDtos === null) {
            return null;
        } else {
            // Prepare the mapping of assignment set with its groupsets
            const preparedASetGroupSetsMapping: Map<number, GroupSetDtoBrief[]> =
                this.prepareAssignmentGroupSetsMappingDtosToMap(this.props.assignmentGroupSetsMappingDtos);

            // Put the AssignmentSetListEntry elements in the following map
            const aSetJSXs: JSX.Element[] =
                this.composeAssignmentSetListEntries(assignmentSets, preparedASetGroupSetsMapping);
            return (
                <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                    {aSetJSXs}
                    <AssignmentSetCreatorModal
                        isOpen={this.state.creatorModalOpen}
                        courseID={this.props.match.params.cid}
                        key={-1}
                        onCloseModal={this.toggleCreatorModal} />
                </Row>
            );
        }
    }

    /**
     * Prepares the mapping between AssignmentSets and GroupSets. Generates a Map with as key
     * an assignmentSetID and as value a list of GroupSetDtoBrief objects.
     * @param mappingDtos The Dtos fetched from the API call /courses/:cid/assignmentgroupsetsmappings
     */
    private prepareAssignmentGroupSetsMappingDtosToMap(mappingDtos: AssignmentGroupSetsMappingDto[]) {

        // The prepared mapping to be returned.
        const aSetIDsToGroupSets = new Map<number, GroupSetDtoBrief[]>();

        // Loop over the mappingDtos and fill the map
        for (const mappingDto of mappingDtos) {
            const aSetDtoBrief = mappingDto.assignmentSet;
            const groupSetDtoBrief = mappingDto.groupSet;

            // Put an empty list if there is no key yet for this aSetDtoBrief
            if (aSetIDsToGroupSets.get(aSetDtoBrief.id) === undefined) {
                aSetIDsToGroupSets.set(aSetDtoBrief.id, []);
            }

            // Push the groupSetDtoBrief to the value of the corresponding key
            aSetIDsToGroupSets.get(aSetDtoBrief.id)!.push(groupSetDtoBrief);
        }

        return aSetIDsToGroupSets;
    }

    /**
     * Creates a list of JSX elements, pushing JSX elements based on the following scenarios:
     * 1. A waiting spinner in case the aSetDtoBriefs is null
     * 2. The actual AssignmentSetListEntry JSX element in case there are assignment sets for this courseDtoFull
     * 3. An Alert displaying that there are no assignment sets for this courseDtoFull if the aSetDtoBriefs is empty
     * @param aSetDtoBriefs The list of AssignmentSetDtoBriefs, necessary for displaying the AssignmentSetListEntry
     * @param preparedASetGroupSetsMapping A Map that maps assignmentSetID to a list of GroupSetDtoBriefs
     */
    private composeAssignmentSetListEntries(
        aSetDtoBriefs: AssignmentSetDtoBrief[],
        preparedASetGroupSetsMapping: Map<number, GroupSetDtoBrief[]>,
    ) {

        // The JSX.Element[] list to be returned
        const aSetJSXs: JSX.Element[] = [];

        const canEdit = this.props.permissions != null
            && assignmentSetsAnyEdit.check(this.props.match.params.cid, this.props.permissions);

        const canCreate = this.props.permissions != null
            && assignmentSetsAnyCreate.check(this.props.match.params.cid, this.props.permissions);

        if (canCreate) {
            aSetJSXs.push(
                <Card key={-1}
                    className="m-2 shadow-sm aset-card-create" onClick={() => this.toggleCreatorModal()}>
                    <CardBody className="d-flex vertical-center" style={{ color: "#007bff" }}>
                        <div className="mx-auto my-auto text-center">
                            <FontAwesomeIcon icon={faPlus} size="4x" />
                            <br /><big className="mt-4 d-block">Create assignment set</big>
                        </div>
                    </CardBody>
                </Card>,
            );
        }

        // Put entries in the list only if there are assignmentSetDtoBriefs
        if (aSetDtoBriefs.length > 0) {
            // Loop over each assignmentSetDtoBrief and put
            for (const aSetDtoBrief of aSetDtoBriefs) {

                // Retrieve the groupSets mapped to the assignmentSet
                const groupSets = preparedASetGroupSetsMapping.get(aSetDtoBrief.id);

                // Push an AssignmentSetListEntry with the necessary details
                aSetJSXs.push(
                    <AssignmentSetListEntry
                        key={aSetDtoBrief.id}
                        courseId={this.props.match.params.cid}
                        assignmentSet={aSetDtoBrief}
                        canEdit={canEdit}
                        groupSets={groupSets !== undefined ? groupSets : []} />,
                );
            }
        }
        return aSetJSXs;
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    assignmentGroupSetsMappingDtos: getAssignmentGroupSetsMappingDtos(state),
    getAssignmentSets: () => getAssignmentSets(state),
    permissions: getCoursePermissions(state),
}), {
        fetchAssignmentGroupSetsMappingDtos: assignmentGroupSetsMappingsFetchRequestedAction,
        fetchAssignmentSets: assignmentSetsFetchRequestedAction,
    })(AssignmentSetManager));
