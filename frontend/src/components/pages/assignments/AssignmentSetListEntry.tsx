import React, { Component } from 'react';
import { Card, Button, Badge } from 'reactstrap';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { AssignmentSetDtoBrief, GroupSetDtoBrief } from '../../../state/types';
import CardFooter from 'reactstrap/lib/CardFooter';

interface AssignmentSetListEntryProps {
    assignmentSet: AssignmentSetDtoBrief;
    groupSets: GroupSetDtoBrief[];
}

interface AssignmentSetListEntryState {}

export default class AssignmentSetListEntry extends
    Component<AssignmentSetListEntryProps, AssignmentSetListEntryState> {

    render() {
        const groupSetTags = this.props.groupSets.map((groupSetDtoBrief) =>
            <Badge color="primary" className="mx-1" key={groupSetDtoBrief.id}>{groupSetDtoBrief.name}</Badge>);

        return (
            <Card className="my-3 AssignmentSetCard">
                <CardHeader>

                    <h5>{this.props.assignmentSet.name}</h5>
                </CardHeader>
                <CardBody>
                    <p>
                        {
                            groupSetTags.length > 0 ?
                                <span><small>Group sets:</small><br/>{groupSetTags}</span> :
                                <small className="text-muted">No group sets assigned yet.</small>
                        }
                    </p>
                </CardBody>
                <CardFooter>
                <Button outline block color="primary" size="md"><FontAwesomeIcon icon={faEdit} /> Edit</Button>
                </CardFooter>
            </Card>
        );
    }
}
