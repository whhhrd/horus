import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner, Container, Row, Col } from "reactstrap";
import { RouteComponentProps, withRouter } from "react-router";
import { GroupDtoFull } from "../../../../../state/types";
import { ApplicationState } from "../../../../../state/state";
import { getGroups } from "../../../../../state/groups/selectors";
import { groupsFetchRequestedAction, GroupsFetchAction } from "../../../../../state/groups/actions";
import GroupListItem from "./GroupListItem";

interface GroupManagerProps {
    groups: GroupDtoFull[] | null;
    fetchGroups: (groupSetId: number) => GroupsFetchAction;
}

class GroupManager extends Component<GroupManagerProps & RouteComponentProps<any>> {

    componentDidMount() {
        this.props.fetchGroups(this.props.match.params.gsid);
    }

    render() {
        const { groups } = this.props;

        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Group Sets Manager
                        { groups == null &&
                            <Spinner color="primary" type="grow"></Spinner>
                        }
                        </h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2">
                    { groups != null &&
                        groups.map( (group) =>
                            <GroupListItem key={group.id} group={group} />,
                        )
                    }
                </Row>
            </Container>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    groups: getGroups(state),
}), {
    fetchGroups: groupsFetchRequestedAction,
})(GroupManager));
