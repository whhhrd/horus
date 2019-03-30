import React, { PureComponent } from "react";
import { GroupDtoFull } from "../../../../../api/types";
import { Card, CardTitle, CardBody, Col, Badge, Button } from "reactstrap";

interface GroupListItemProps {
    group: GroupDtoFull;
    onShowClick: (gid: number) => any;
    showButton: boolean;
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
            <Col xs="12" md="6" lg="12" xl="6">
                <Card className="m-0 my-2 mw-100">
                    <CardBody className="py-2">
                        <CardTitle className="d-flex align-items-center justify-content-between">
                            <div title={name} className="ellipsis mr-2">
                                {name}
                            </div>
                            <div className="d-flex flex-nowrap">
                                <div>
                                    <Badge
                                        pill
                                        color="light"
                                        className="mr-4 shadow-sm"
                                    >
                                        {participants.length > 0
                                            ? participants.length
                                            : "No"}{" "}
                                        students
                                    </Badge>
                                </div>
                                {this.props.showButton && (
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() =>
                                            this.onShowClick(
                                                this.props.group.id,
                                            )
                                        }
                                    >
                                        Show
                                    </Button>
                                )}
                            </div>
                        </CardTitle>
                    </CardBody>
                </Card>
            </Col>
        );
    }
}
