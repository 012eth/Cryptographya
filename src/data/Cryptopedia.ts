// @ts-nocheck

export default [
    {
        blockchain: {
            consensus: {
                proof_of_stake: {
                    staking: {},
                    validators: {},
                    delegators: {},
                },
                proof_of_work: {
                    miners: {
                        cpu: {},
                        gpu: {},
                        asic: {}, // "application-specific integrated circuit"
                    },
                    hash_power: {},
                },
            },
            bitcoin: {
                btc: {},
            },
            l1: {
                ethereum: {
                    eth: {},
                    smart_contracts: {},
                    gas: {},
                    eip: {},
                    siwe: {},
                    ens: {},
                },
                monero: {},
                avalanche: {},
                cosmos: {},
                bsc: {},
                litecoin: {},
                ripple: {},
                solana: {},
                dogecoin: {},
                polkadot: {},
            },
            l2: {
                rollups: {
                    optimistic: {
                        optimism: {},
                        arbitrum: {},
                    },
                    zero_knowledge: {
                        zkSync: {},
                        dydx: {},
                    },
                },
                validium: {},
                plasma: {},
                sidechains: {},
                application_specific: {
                    loopring: {},
                },
                polygon: {},
                fantom: {},
            },
            wallets: {
                public_key: {
                    privateKey: {},
                },
                metamask: {},
                hot_wallet: {},
                cold_wallet: {
                    ledger: {},
                    trezor: {},
                },
                signature: {},
                transaction: {},
            },
        },
    },
    {
        exchanges: {
            centralized_exchanges: {
                binance: {},
                bitfinex: {},
                coinbase: {},
                kraken: {},
                poloniex: {},
            },
            decentralized_exchanges: {
                uniswap: {},
                pancake_swap: {},
                trader_joe: {},
            },
        },
    },
    { stable_coins: {} },
    { ETF: {} },
    { NFT: {} },
    { metaverse: {} },
    { storage: {} },
    { gaming: {} },
    { defi: {} },
    { oracles: {} },
    { airdrop: {} },
    { hard_fork: {} },
    { soft_fork: {} },
    { airdrops: {} },
];

export function flatt(b) {
  const rec = (a) =>
    Object.entries(a)
      .map(([key, child]) => [
        { [key]: { n: Object.keys(child) } },
        ...rec(child),
      ])
      .flat();

  return rec(b).reduce((acc, curr) => {
    const [key, value] = Object.entries(curr)[0];
    return { ...acc, [key]: value };
  }, {});
}
