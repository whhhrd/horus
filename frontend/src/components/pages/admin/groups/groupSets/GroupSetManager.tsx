import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Container, Row, Spinner, Col } from "reactstrap";

import { getGroupSets } from "../../../../../state/groups/selectors";
import { groupSetsFetchRequestedAction } from "../../../../../state/groups/actions";

import { GroupSetDtoSummary } from "../../../../../state/types";
import { ApplicationState } from "../../../../../state/state";
import CanvasCard from "../../../../CanvasCard";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

interface GroupSetManagerProps {

    groupSets: GroupSetDtoSummary[] | null;

    fetchGroupSets: (courseId: number) => {
        type: string,
    };
}

class GroupSetManager extends Component<GroupSetManagerProps & RouteComponentProps<any>> {

    componentDidMount() {
        // Fetch the GroupSets
        this.props.fetchGroupSets(this.props.match.params.cid);
    }

    render() {
        const { groupSets } = this.props;
        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Group Sets Manager
                        { groupSets == null &&
                            <Spinner color="primary" type="grow"></Spinner>
                        }
                        </h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2">
                    { groupSets != null &&
                        groupSets.map( (gSet) =>
                            <CanvasCard
                                watermarkIcon={faUsers}
                                key={gSet.id}
                                cardTitle={gSet.name}
                                url={`/courses/${gSet.course.id}/administration/groupsets/${gSet.id}`}
                            />,
                        )
                    }
                </Row>
            </Container>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    groupSets: getGroupSets(state),
}), {
    fetchGroupSets: groupSetsFetchRequestedAction,
})(GroupSetManager));
