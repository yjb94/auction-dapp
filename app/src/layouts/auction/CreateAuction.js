import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";
import ipfs from '../../utils/ipfs';
import Image from '../../components/DataDisplay/Image';
import Input from '../../components/DataEntry/Input';
import StateButton, { ButtonState } from '../../components/Button/StateButton';

class CreateAuction extends Component {
    state = {
        imageUrl:'',
        isFetching:false
    }

    constructor(props, context) {
        super(props);
    }
    componentWillMount() {
        this.handleView();
    }
    
    handleView = async()=> {
        const that =  this;
        const { hash } = this.props.match.params;
        
        if (hash !== null) {
            ipfs.cat(hash, function (err, data) {
                if (err) {
                    throw err
                }
                const arrayBufferView = new Uint8Array(data);
                const blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL( blob );
                that.setState({ imageUrl });
            });
        }
        
    }

    onInputChange = (e) => {
        e.preventDefault();
        let state = {};
        state[e.target.id] = e.target.value;
        this.setState(state);
    }

    render() {
        const { imageUrl, title, description, price, isFetching } = this.state;

        return (
            <Container>
                <Image src={imageUrl}/>
                <BottomContainer>
                    <InputsContainer>
                        <Input
                            id={'title'} 
                            value={title} 
                            label={'title'}
                            onChange={this.onInputChange}
                        />
                        <Input
                            id={'description'} 
                            value={description} 
                            label={'description'}
                            multiline={true}
                            onChange={this.onInputChange}
                        />
                        <Input
                            id={'price'} 
                            value={price} 
                            label={'price'}
                            onChange={this.onInputChange}
                        />
                    </InputsContainer>
                    <ButtonsContainer>
                        <StateButton
                            onClick={this.handleUpload}
                            buttonState={isFetching ? ButtonState.loading : ButtonState.idle}
                        >
                            Create auction
                        </StateButton>
                    </ButtonsContainer>
                </BottomContainer>
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
const BottomContainer = styled.div`
    display:flex;
    flex-direction:column;
    margin-bottom:60px;
`;

const InputsContainer = styled.div`
    align-self:flex-start;
    margin-top:30px;
`;
const ButtonsContainer = styled.div`
    margin-top:30px;
`;


CreateAuction.contextTypes = {
    drizzle: PropTypes.object
}

export default CreateAuction