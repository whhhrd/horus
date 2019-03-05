import React, { PureComponent } from "react";
import { GroupDtoFull } from "../../../../../state/types";
import { Card, CardTitle, CardBody, Col, Badge, Button, Collapse, Table } from "reactstrap";

interface GroupListItemProps {
    group: GroupDtoFull;
}

interface GroupListItemState {
    showGroupContent: boolean;
}

export default class GroupListItem extends PureComponent<GroupListItemProps, GroupListItemState> {

    constructor(props: GroupListItemProps) {
        super(props);
        this.state = {
            showGroupContent: false,
        };
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    toggleCollapse() {
        this.setState((state) => ({ showGroupContent: !state.showGroupContent }));
    }

    render() {
        const { name, participants } = this.props.group;

        return (
            <Col lg="6" xs="12">
                <Card className="m-0 my-2 mw-100">
                    <CardBody className="py-2">
                        <div className="d-flex justify-content-between">
                            <CardTitle className="my-auto">
                                {name}
                            </CardTitle>
                            <div>
                                <Badge pill color="light" className="mr-4 shadow-sm">
                                    {participants.length > 0 ? participants.length : "No"} students</Badge>
                                <Button color="primary" size="sm" onClick={() => this.toggleCollapse()}>
                                    {this.state.showGroupContent ? "Hide" : "Show"}
                                </Button>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.showGroupContent}>
                            {participants.length > 0 && <Table className="mt-3">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Student number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        participants.map((p) =>
                                            <tr key={p.id}>
                                                <td>{p.person.fullName}</td>
                                                <td>{p.person.loginId}</td>
                                            </tr>)
                                    }
                                </tbody>
                            </Table>}
                            {participants.length === 0 &&
                                <small className="text-muted">This group is empty.</small>
                            }
                        </Collapse>
                    </CardBody>
                </Card>
            </Col>
        );
    }

}
