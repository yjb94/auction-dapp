import React, { Component } from 'react'
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FilePond, registerPlugin } from 'react-filepond';

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond/dist/filepond.min.css';

import firebase from "firebase";

import ipfs from '../../utils/ipfs';
import '../../css/filepond-custom.css'
import StateButton, { ButtonState } from '../../components/Button/StateButton';

class IpfsImgUpload extends Component {

    state = {
        ipfsHash: null,
        buffer: '',
        files: [],
        imageUrl: null,

        isFetching:false
    };

    constructor(props, context) {
        super(props);

        registerPlugin(FilePondPluginImagePreview);

        this.contracts = context.drizzle.contracts;
        this.deedIpfsToken = this.contracts.DeedIPFSToken;
    }

    componentDidMount = () => {
        document.addEventListener("FilePond:addfile", this.readFile);

        this.deedIpfsToken.events.Transfer().on("data", _ => {
            this.setState({ isFetching:false });
        });
    }

    readFile = () => {
        if (this.pond != null) {

            const file = this.pond.props.children[0].props.src; //single file

            let reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => this.fileToBuffer(reader);
        }
    };

    fileToBuffer = async (reader) => {
        //buffering ready to upload to IPFS
        const buffer = await Buffer.from(reader.result);
        this.setState({buffer});
    }

    validate = () => {
        const { files } = this.state;
        var err_msg = "";

        // if(!price)
        //     err_msg = 'no price';
        
        // if(!description)
        //     err_msg = 'no description';
            
        // if(!title)
        //     err_msg = 'no title';

        if(files.length === 0)
            err_msg = 'no file';

        err_msg && alert(err_msg);
        return !err_msg
    }

    handleUpload = async () => {
        if (this.validate()) {
            this.setState({ ipfsHash: '', isFetching:true });

            await ipfs.add(this.state.buffer, (err, ipfsHash) => {
                this.setState({ ipfsHash:ipfsHash[0].hash });
                this.deedIpfsToken.methods.mint.cacheSend(ipfsHash[0].hash);

                // var storageRef = firebase.storage().ref();
                // storageRef.child(`images/${Math.random().toString(36).substring(7)}.jpg`).put(this.state.buffer).then(function(snapshot) {
                //     let updates = {};
                //     updates[`images/${ipfsHash[0].hash}`] = {
                //         uri:`https://firebasestorage.googleapis.com/v0/b/auction-dapp.appspot.com/o/${snapshot.metadata.fullPath}?alt=media`
                //     };

                //     let dbRef = firebase.database().ref();
                //     dbRef.update(updates, error => {
                //     });
                // });
            })
        }
    }

    handleView = async () => {
        const that = this;
        const hash = this.state.ipfsHash;

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
            });
        }
    }

    handleReset = () => {
        this.setState({imageUrl: null});
        this.pond.removeFile();
    }

    render() {
        const { isFetching } =  this.state;

        return (
            <Container>
                <FilePond ref={ref => this.pond = ref}
                    onupdatefiles={(fileItems) => {
                        // Set current file objects to this.state
                        this.setState({
                            files: fileItems.map(fileItem => fileItem.file)
                        });
                    }}
                >
                    {this.state.files.map(file => (
                        <input type="file" key={file} src={file} />
                    ))}
                </FilePond>
                <div>
                    {this.state.imageUrl && <img alt="" src={this.state.imageUrl} className="img-view"/>} {this.state.ipfsHash}
                </div>
                <BottomContainer>
                    <InputsContainer>
                    </InputsContainer>

                    <ButtonsContainer>
                        <ButtonContainer>
                            <StateButton 
                                onClick={this.handleUpload}
                                buttonState={isFetching ? ButtonState.loading : ButtonState.idle}
                            >
                                Upload & Create
                            </StateButton>
                        </ButtonContainer>
                        <ButtonContainer>
                            <StateButton 
                                onClick={this.handleView}
                            >
                                View
                            </StateButton>
                        </ButtonContainer>
                        <ButtonContainer>
                            <StateButton 
                                onClick={this.handleReset}
                            >
                                Reset
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
    flex-direction:column;
    box-sizing: border-box;
    width: calc(100% - 60px);
    max-width: 720px;
    padding: 45px 20px;
    margin: 0 auto;
`;

const BottomContainer = styled.div`
    display:flex;
    justify-content:space-between;
`;

const InputsContainer = styled.div`
`;

const ButtonsContainer = styled.div`
    display:flex;
    flex-direction:column;
    width: calc(50% - 60px);
    max-width:360px;
`;
const ButtonContainer = styled.div`
    margin-bottom:10px;
`;

IpfsImgUpload.contextTypes = {
    drizzle: PropTypes.object
}

export default IpfsImgUpload
