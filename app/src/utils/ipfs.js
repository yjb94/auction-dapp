import ipfsClient from 'ipfs-http-client';

const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export default ipfs;