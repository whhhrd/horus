import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';

interface HomeProps {}

interface HomeState {}

export default class Home extends Component<HomeProps, HomeState> {

    public render() {
        return (
            <Container>
                <h1>Horus Home</h1>
                <Link to="/login">Log out</Link>
            </Container>
        );
    }
}