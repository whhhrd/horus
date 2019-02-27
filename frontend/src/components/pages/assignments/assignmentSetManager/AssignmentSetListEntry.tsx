import React, { Component } from 'react';
import { Card, Button, Badge, CardTitle } from 'reactstrap';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { AssignmentSetDtoBrief, GroupSetDtoBrief } from '../../../../state/types';
import CardFooter from 'reactstrap/lib/CardFooter';

interface AssignmentSetListEntryProps {
    assignmentSet: AssignmentSetDtoBrief;
    groupSets: GroupSetDtoBrief[];
}

export default class AssignmentSetListEntry extends Component<AssignmentSetListEntryProps> {

    render() {
        const groupSetTags = this.props.groupSets.map((groupSetDtoBrief) =>
            <Badge color="primary" className="mx-1" key={groupSetDtoBrief.id}>{groupSetDtoBrief.name}</Badge>);

        return (
            <Card className="my-3 aset-card">
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
                    <Button outline block color="primary" size="md"><FontAwesomeIcon icon={faEdit} /> Edit</Button>
                </CardFooter>
            </Card>
        );
    }
}
