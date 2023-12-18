import {createWeb3Modal, defaultConfig} from "@web3modal/ethers5";

const projectId = import.meta.env.PUBLIC_WALLET_CONNECT_KEY;
const alchemyApiKey = import.meta.env.PUBLIC_ALCHEMY_API_KEY;

const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
}

const sepolia = {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/' + alchemyApiKey
}

const goerli = {
    chainId: 5,
    name: 'Goerli',
    currency: 'ETH',
    explorerUrl: 'https://goerli.etherscan.io',
    rpcUrl: 'https://gateway.tenderly.co/public/goerli',
};

const metadata = {
    name: 'My Test Website',
    description: 'Test',
    url: 'https://test.com',
    icons: ['https://avatars.test.com/']
}

const web3modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet, sepolia, goerli],
    projectId
});

export default web3modal