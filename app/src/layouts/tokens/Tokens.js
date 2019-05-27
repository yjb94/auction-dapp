import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";
import Masonry from '../../components/DataDisplay/Masonry';
import ipfs from '../../utils/ipfs';
import Card from '../../components/DataDisplay/Card';
import { Link } from 'react-router-dom'

class Tokens extends Component {
    state = {
        items : [],
        flag: false,
        tokenId: null,
        buttonType: null,
        imageUrl: null,
        ipfsHash: null,
        flag2:0
    }

    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.deedIPFSToken = this.contracts.DeedIPFSToken;

        this.isTokenList = true;
    }

    handleTransfer = (e) => {
        this.showInputAddress(e.target.id, 'T');
    }

    handleApprove = (e) => {
        this.showInputAddress(e.target.id, 'A');
    }

    showInputAddress = (tokenId, buttonType) => {
        if (!this.state.flag) {
            this.setState({flag: true, tokenId, buttonType});
        } else {
            this.setState({flag: false, tokenId, buttonType});
        }
    }

    handleRemove = (e) => {
        const tokenId = e.target.id;
        this.deedIPFSToken.methods.burn.cacheSend(tokenId);
    }

    handleView = async(callback)=> {
        const that =  this;
        const hash =  this.state.ipfsHash;
        
        if (hash !== null) {
            ipfs.cat(hash, function (err, data) {
                if (err) {
                    throw err
                }
                const arrayBufferView = new Uint8Array(data);
                const blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL( blob );
                that.setState({imageUrl});
                callback && callback();
            });
        }
        
    }

    getTokenList = async (event) => {
        if (this.isTokenList) {
            let t = 0, apr = 0, asset = null;
            let items = [];
            const totalSupply = await this.deedIPFSToken.methods.totalSupply().call();

            for (let j=0; j<totalSupply; j++) {

                t = await this.deedIPFSToken.methods.tokenByIndex(j).call();
                apr = await this.deedIPFSToken.methods.getApproved(t).call();
                
                const ipfsHash = await this.deedIPFSToken.methods.tokenURI(t).call();
                this.setState({ipfsHash});
                

                if (await this.deedIPFSToken.methods.ownerOf(t).call() === this.props.accounts[0]) {
                    asset = await this.deedIPFSToken.methods.allTokens(t).call();
                    // eslint-disable-next-line
                    this.handleView(() => {
                        items.push({
                            f: this.state.imageUrl,
                            tokenId: t,
                            approved: apr,
                            ipfsHash: this.state.ipfsHash
                        });
                    });
                      
                }
            }
            this.setState({items});
        }

        if (event !== undefined) {
            console.log(event.returnValues);
        }
    }

    componentWillUnmount() {
        this.isTokenList = false;
    }

    async componentDidMount() {
        await this.getTokenList();
        //event listening
        this.deedIPFSToken.events.Transfer().on("data", (event) => this.getTokenList(event));
    }

    render() {
        const { items } = this.state;

        let cardViews = Object.keys(items).map((each, idx) => {
            const item = items[each];
            const art = {
                image:item.f,
                title:item.ipfsHash
            }
            return (
                <Link
                    key={idx} 
                    to={`/artwork/${item.ipfsHash}`}
                >
                    <Card 
                        key={idx}
                        {...art}
                    />
                </Link>
            )
        })

        return (
            <Container>
                <TitleText>
                    Artworks
                </TitleText>
                {cardViews && cardViews.length > 0 &&
                    <MasonryContainer>
                        <Masonry views={cardViews}/>
                    </MasonryContainer>
                }
            </Container>
        )
    }
}

const Container = styled.div`
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top:30px;
`;
const TitleText = styled.div`
    font-size: 3em;
    text-align: left;
    font-family: 'Sloop Script';
    color:#777;
`;

const MasonryContainer = styled.div`
    padding: 100px 50px;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 1024px) {
        padding: 60px 30px;
    }
    @media (max-width: 764px) {
        padding: 40px 20px;
    }
    @media (max-width: 480px) {
        padding: 10px;
    }
`;

Tokens.contextTypes = {
    drizzle: PropTypes.object
}

export default Tokens