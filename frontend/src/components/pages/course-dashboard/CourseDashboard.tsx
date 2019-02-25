import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ApplicationState } from '../../../state/state';
import { connect } from 'react-redux';
import { getCourse } from '../../../state/course-selection/selectors';
import { CourseDtoFull, CourseDtoBrief, CourseDtoSummary, AssignmentSetDtoBrief } from '../../../state/types';
import { courseRequestedAction } from '../../../state/course-selection/action';
import { Spinner } from 'reactstrap';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import Card from 'reactstrap/lib/Card';
import { NOTIFICATION_ACTION_CONNECTOR } from '../../../state/notifications/constants';
import CardHeader from 'reactstrap/lib/CardHeader';
import { randomColor } from '../../util';
import CardBody from 'reactstrap/lib/CardBody';
import CardTitle from 'reactstrap/lib/CardTitle';
import { NotificationProps } from '../../../state/notifications/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const FIXED_SIDEBAR_WIDTH = 700;

interface CourseDashboardProps {
    course: (id: number) => CourseDtoSummary | undefined;
    requestCourse: (id: number) => {
        type: string,
    }
}
interface CourseDashboardState {
    width: number;
    sidebarOpen: boolean;
}

class CourseDashboard extends Component<CourseDashboardProps & RouteComponentProps<any> & NotificationProps, CourseDashboardState> {
    constructor(props: CourseDashboardProps & RouteComponentProps<any> & NotificationProps) {
        super(props);
        this.state = {
            width: window.innerWidth,
            sidebarOpen: false,
        };
    }

    private isFullCourse(course: CourseDtoBrief): course is CourseDtoFull {
        return (course as CourseDtoFull).assignmentSets !== undefined;
    }

    private spinner = <Spinner color="primary" type="grow" />;

    private headingText = () => {
        const course = this.props.course(+this.props.match.params.id);
        if (course === undefined) {
            return (
                <h3>
                    Loading {this.spinner}
                </h3>
            );
        } else if (!this.isFullCourse(course)) {
            return (
                <h3>
                    {course.name} {this.spinner}
                </h3>
            );
        } else {
            return (
                <div>
                    <h3>
                        {course.name}
                    </h3>
                    {this.state.width < FIXED_SIDEBAR_WIDTH && !this.state.sidebarOpen &&
                        <div onClick={() => this.setState({ sidebarOpen: true })}>
                            <FontAwesomeIcon icon={faBars} style={{ position: "absolute", top: 0, right: 0 }} size="2x" />
                        </div>}
                </div>
            );
        }
    }

    private handleResize = () => {
        this.setState({
            width: window.innerWidth,
            sidebarOpen: this.state.sidebarOpen && window.innerWidth < FIXED_SIDEBAR_WIDTH
        });
    }

    private buildSideBarContent = () => {
        return (
            <h4>Sidebar content here</h4>
        )
    }

    public componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        this.props.requestCourse(+this.props.match.params.id);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    private buildSideBar = () => {
        if (this.state.width > 700) {
            return (
                <div className="dashboard-sidebar">
                    {this.buildSideBarContent()}
                </div>
            )
        } else if (this.state.sidebarOpen) {
            return (
                <div className="dashboard-sidebar-mobile">
                    <div onClick={() => this.setState({ sidebarOpen: false })}>
                        <FontAwesomeIcon icon={faBars}
                            style={{ position: "absolute", top: "1rem", right: "0.5rem" }} size="2x" />
                    </div>
                    {this.buildSideBarContent()}
                </div>
            );
        } else {
            return null;
        }

    }

    private buildContent = () => {
        const course = this.props.course(+this.props.match.params.id);
        if (course === undefined) {
            return <div />;
        }
        if (this.isFullCourse(course)) {
            return (
                <div className="card-collection" style={{ display: "flex", flexWrap: "wrap" }}>
                    {course.assignmentSets.map((aSet: AssignmentSetDtoBrief) => {
                        return (
                            <Card className="card-clickable" key={aSet.id}
                                onClick={() => this.props.notifyInfo("Not yet implemented")}>
                                <CardHeader
                                    className="card-header-colored"
                                    style={{ backgroundColor: randomColor(aSet.name) }}>
                                </CardHeader>
                                <CardBody>
                                    <CardTitle>
                                        {aSet.name}
                                    </CardTitle>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            );
        } else {
            return <div />;
        }
    }

    public render() {
        return (
            <div style={{ display: "flex" }}>
                <Container fluid={true} style={{ flex: "auto" }}>
                    <Row className="main-body-breadcrumbs px-2 pt-3">
                        <Col md="12">
                            {this.headingText()}
                            <hr />
                        </Col>
                    </Row>
                    <Row className="main-body-display px-2">
                        <Col style={{ padding: 0 }}>
                            {this.buildContent()}
                        </Col>
                    </Row>
                </Container>
                {this.buildSideBar()}
            </div>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    course: (id: number) => getCourse(state, id),
}), {
        requestCourse: (id: number) => courseRequestedAction(id),
        ...NOTIFICATION_ACTION_CONNECTOR
    })(CourseDashboard));