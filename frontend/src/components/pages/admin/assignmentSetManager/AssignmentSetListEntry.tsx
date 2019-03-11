import React, { Component } from "react";
import { Card, Button, Badge, CardTitle } from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";
import CardHeader from "reactstrap/lib/CardHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { AssignmentSetDtoBrief, GroupSetDtoBrief } from "../../../../state/types";
import CardFooter from "reactstrap/lib/CardFooter";
import AssignmentSetEditorModal from "./AssignmentSetEditorModal";

interface AssignmentSetListEntryProps {
    assignmentSet: AssignmentSetDtoBrief;
    groupSets: GroupSetDtoBrief[];
    courseId: number;
    canEdit: boolean;
}

interface AssignmentSetListEntryState {
    editorModalOpen: boolean;
}

export default class AssignmentSetListEntry
    extends Component<AssignmentSetListEntryProps, AssignmentSetListEntryState> {

    constructor(props: AssignmentSetListEntryProps) {
        super(props);
        this.state = {
            editorModalOpen: false,
        };
        this.toggleEditorModal = this.toggleEditorModal.bind(this);
    }

    toggleEditorModal() {
        this.setState((state) => ({ editorModalOpen: !state.editorModalOpen }));
    }

    render() {
        const groupSetTags = this.props.groupSets.map((groupSetDtoBrief) =>
            <Badge color="primary" className="mx-1" key={groupSetDtoBrief.id}>{groupSetDtoBrief.name}</Badge>);

        return (
            <Card className="m-2 shadow-sm aset-card">
                <CardHeader>
                    <CardTitle>{this.props.assignmentSet.name}</CardTitle>
                </CardHeader>
                <CardBody>
                    <p className="mb-0">
                        {
                            groupSetTags.length > 0 ?
                                <span><small>Group sets:</small><br />{groupSetTags}</span> :
                                <small className="text-muted">No group sets assigned yet.</small>
                        }
                    </p>
                </CardBody>
                <CardFooter className="aset-card-footer">
                    {this.props.canEdit &&
                        <Button outline block color="primary" size="md"
                            onClick={() => this.toggleEditorModal()}>
                            <FontAwesomeIcon icon={faEdit} /> Edit
                        </Button>
                    }
                    {this.state.editorModalOpen &&
                        <AssignmentSetEditorModal
                            isOpen={this.state.editorModalOpen}
                            assignmentSetId={this.props.assignmentSet.id}
                            courseId={this.props.courseId}
                            onCloseModal={this.toggleEditorModal} />
                    }
                </CardFooter>
            </Card>
        );
    }
}
