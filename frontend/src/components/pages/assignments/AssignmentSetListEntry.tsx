import React, { Component } from 'react';
import { Card, Button, Badge } from 'reactstrap';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { AssignmentSetDtoBrief, GroupSetDtoBrief } from '../../../state/types';

interface AssignmentSetListEntryProps {
    assignmentSet: AssignmentSetDtoBrief,
    groupSets: GroupSetDtoBrief[],
}

interface AssignmentSetListEntryState { }

export default class AssignmentSetListEntry extends Component<AssignmentSetListEntryProps, AssignmentSetListEntryState> {

    public render() {
        // <Badge className="badge-primary" key={gid}>{groupName}</Badge>;

        const groupSetTags = this.props.groupSets.map((groupSetDtoBrief) =>
            <Badge color="primary" className="mx-1" key={groupSetDtoBrief.id}>{groupSetDtoBrief.name}</Badge>);

        return (
            <Card className="my-3">
                <CardHeader>
                    {this.props.assignmentSet.name}
                    <Button style={{ 'float': 'right' }} color="primary" size="sm"><FontAwesomeIcon icon={faEdit} /> Edit</Button>
                </CardHeader>
                <CardBody>
                    <p>Assigned group sets</p>
                    { groupSetTags.length > 0 ? groupSetTags : <small className="text-muted">No group sets assigned yet.</small> }
                </CardBody>
            </Card>
        );
    }

}