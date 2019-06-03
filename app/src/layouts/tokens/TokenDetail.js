import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";
import ipfs from '../../utils/ipfs';
import Image from '../../components/DataDisplay/Image';
import Input from '../../components/DataEntry/Input';
import StateButton, { ButtonState } from '../../components/Button/StateButton';
import { drizzleConnect } from 'drizzle-react'

class TokenDetail extends Component {
    state = {
        imageUrl:'',
        isCreating:false,
        isDeleting:false
    }
    deleted = false;

    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.deedIPFSToken = this.contracts.DeedIPFSToken;
    }

    componentDidMount() {
        //event listening
        this.deedIPFSToken.events.Transfer().on("data", (event) => {
            if(!!this.getHash() && !this.deleted) {
                this.deleted = true;
                this.setState({ isDeleting:false });
                this.props.history.goBack();
            }
        });
    }

    getHash = async () => {
        const { id } = this.props.match.params;
        var ipfsHash;
        try {
            ipfsHash = await this.deedIPFSToken.methods.tokenURI(id).call();
        } catch(e) {
        }
        return ipfsHash;
    }
    

    componentWillMount() {
        this.load();
    }

    load = async () => {
        const { id } = this.props.match.params;
        
        const ipfsHash = await this.getHash();
        if(!ipfsHash) {
            this.deleted = true;
            this.props.history.goBack();
        }
        this.setState({ipfsHash});

        if (await this.deedIPFSToken.methods.ownerOf(id).call() === this.props.accounts[0]) {
            await this.deedIPFSToken.methods.allTokens(id).call();
            this.handleView(ipfsHash);
        }
    }
    
    handleView = async (hash)=> {
        const that =  this;
        
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

    handleUpload = () => {
        
    }

    handleRemove = async (e) => {
        this.setState({ isDeleting:true });
        const { id } = this.props.match.params;
        await this.deedIPFSToken.methods.burn.cacheSend(id);
    }

    onInputChange = (e) => {
        e.preventDefault();
        let state = {};
        state[e.target.id] = e.target.value;
        this.setState(state);
    }

    render() {
        const { imageUrl, title, description, price, isCreating, isDeleting } = this.state;

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
                        <ButtonContainer>
                            <StateButton
                                onClick={this.handleUpload}
                                buttonState={isCreating ? ButtonState.loading : ButtonState.idle}
                            >
                                Create auction
                            </StateButton>
                        </ButtonContainer>

                        <ButtonContainer>
                            <StateButton
                                onClick={this.handleRemove}
                                buttonState={isDeleting ? ButtonState.loading : ButtonState.idle}
                            >
                                Delete artwork
                            </StateButton>
                        </ButtonContainer>
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
const ButtonContainer = styled.div`
    margin-bottom:10px;
`;


TokenDetail.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
        deedIPFSToken: state.contracts.DeedIPFSToken,
        accounts: state.accounts,
        drizzleStatus: state.drizzleStatus
    }
}

export default drizzleConnect(TokenDetail, mapStateToProps)