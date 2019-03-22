import { PureComponent } from "react";
import React from "react";
import { Badge } from "reactstrap";
import { SupplementaryRoleDto } from "../../../../api/types";

interface SuppRoleLabelProps {
    role: SupplementaryRoleDto;
    className?: string;
}

export default class SuppRoleLabel extends PureComponent<SuppRoleLabelProps> {
    render() {
        const { name } = this.props.role;
        return (
            <Badge
                color="primary"
                className={`supp-role-label mr-2 mb-2 py-2 px-3 shadow-sm ${
                    this.props.className != undefined
                        ? this.props.className
                        : ""
                }`}
            >
                {name}
                {this.props.children}
            </Badge>
        );
    }
}