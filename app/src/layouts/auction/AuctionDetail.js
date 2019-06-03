import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";
import ipfs from '../../utils/ipfs';
import { drizzleConnect } from 'drizzle-react'
import { BASE_URI } from '../../constants/general';
import axios from "axios";
import moment from 'moment';

class AuctionDetail extends Component {
    state = {
        imageUrl:'',
    }
    deleted = false;

    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.deedIPFSToken = this.contracts.DeedIPFSToken;
    }

    componentWillMount() {
        // this.load();
    }

    componentDidMount() {
        // this.deedIPFSToken.events.Transfer().on("data", (event) => {
        //     if(!!this.getHash() && !this.deleted) {
        //         this.deleted = true;
        //         this.setState({ isDeleting:false });
        //         this.props.history.goBack();
        //     }
        // });
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
        const endpoint = BASE_URI + 'createAuction';
        const { title, description, price, date } = this.state;
        const { id } = this.props.match.params;
        const { accounts } = this.props
        const formattedDate = moment(date).format("X")
    
        axios.post(endpoint, {
            userId:accounts[0],
            tokenId:id,
            title:title,
            description:description,
            price:price,
            due:formattedDate
         })
        .then( response => {
            console.log(response);
        })
        .catch( err => {console.log(err)});
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

    handleChange = (date) => {
        this.setState({
           date: date
        });
    }

    render() {
        const { item } = this.props.location;

        return (
            <Container>
                <Title>
                    Title: {item.title}
                </Title>
                <DescripTion>
                    Description: {item.description}
                </DescripTion>
                <Price>
                    Price: {item.price}
                </Price>
                <Due>
                    Due: {moment.unix(item.due).format('YYYY.MM.DD')}
                </Due>
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

const Title = styled.div`
`;

const DescripTion = styled.div`
`;

const Price = styled.div`
`;

const Due = styled.div`
`;


AuctionDetail.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
        deedIPFSToken: state.contracts.DeedIPFSToken,
        accounts: state.accounts,
        drizzleStatus: state.drizzleStatus
    }
}

export default drizzleConnect(AuctionDetail, mapStateToProps)