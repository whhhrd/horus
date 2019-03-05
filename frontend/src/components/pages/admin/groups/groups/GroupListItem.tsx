import React, { PureComponent } from "react";
import { GroupDtoFull } from "../../../../../state/types";
import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";

interface GroupListItemProps {
    group: GroupDtoFull;
}

export default class GroupListItem extends PureComponent<GroupListItemProps> {

    render() {
        const { name, participants } = this.props.group;

        return (
            <Card>
                <CardHeader >
                    <CardTitle>
                        {name}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    { participants.length > 0 &&
                        participants.map( (p) => <div key={p.id}>{p.person.fullName}</div>)
                    }
                    { participants.length === 0 &&
                        <small className="text-muted">This group is empty.</small>
                    }
                </CardBody>
            </Card>
        );
    }

}
