# Alpha Memes — Solana Launchpad

Devnet-first Solana token launchpad project.

Planned modules include SPL token creation and management, Metaplex metadata, IPFS image/metadata hosting through Pinata, Raydium CPMM pool creation and liquidity management, and wallet transaction history.

## Safety

- Devnet only during testing.
- Every on-chain action must be approved by the connected wallet.
- Never commit wallet seed phrases, private keys, RPC secrets, or Pinata JWTs.

## Deployment

Render Node web service. Build: `npm install && npm run build`. Start: `npm start`. Health check: `/api/health`.

`PINATA_JWT` must be configured as a secret environment variable in Render for permanent IPFS uploads.

> Note: this repository is being initialized; on-chain features require build and Devnet verification before production use.
