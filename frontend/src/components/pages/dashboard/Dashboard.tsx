import React, { Component } from 'react';
import { Container } from 'reactstrap';

interface DashboardProps {

}
interface DashboardState {

}


export default class Dashboard extends Component<DashboardProps, DashboardState> {
    public render() {
        return (
            <Container>
                <h1>Course Dashboard</h1>
            </Container>
        );
    }
}