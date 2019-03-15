import React, { PureComponent } from "react";
import { GroupDtoFull } from "../../../../../api/types";
import { Card, CardTitle, CardBody, Col, Badge, Button } from "reactstrap";

interface GroupListItemProps {
    group: GroupDtoFull;
    onShowClick: (gid: number) => any;
}

export default class GroupListItem extends PureComponent<GroupListItemProps> {

    constructor(props: GroupListItemProps) {
        super(props);
        this.onShowClick = this.onShowClick.bind(this);
    }

    onShowClick(gid: number) {
        this.props.onShowClick(gid);
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
                                <Button color="primary" size="sm" onClick={() => this.onShowClick(this.props.group.id)}>
                                    Show
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        );
    }

}
