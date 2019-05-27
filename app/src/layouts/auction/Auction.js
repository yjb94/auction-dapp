import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";
import Banner from '../../components/DataDisplay/Banner';

class Auction extends Component {
    state = {
    }

    constructor(props, context) {
        super(props);
        
    }
    componentWillUnmount() {
    }

    async componentDidMount() {
    }

    render() {
        return (
            <Container>
                <Banner
                    title={'Smart art gallery'}
                    subtitle={''}
                    image={'https://www.castlefineart.com/assets/img/resized/fullscreen/galleries-icc.jpg'}
                    style={{
                        justifyContent:'flex-end',
                        alignItems:'flex-start',
                    }}
                />
            </Container>
        )
    }
}

const Container = styled.div`
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

Auction.contextTypes = {
    drizzle: PropTypes.object
}

export default Auction