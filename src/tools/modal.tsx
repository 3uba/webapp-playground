import {createWeb3Modal, defaultConfig} from "@web3modal/ethers5";

const projectId = import.meta.env.PUBLIC_WALLET_CONNECT_KEY;

const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
}

const metadata = {
    name: 'My Test Website',
    description: 'Test',
    url: 'https://test.com',
    icons: ['https://avatars.test.com/']
}

const web3modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId
});

export default web3modal