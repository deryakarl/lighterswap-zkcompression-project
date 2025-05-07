# LightSwap

A minimalist token swap interface for Solana with ZK compression.

![LightSwap Screenshot](https://sjc.microlink.io/Fh_-S6f30O_4IpYbq_ZGtuir82LgEmGmyeuPIj92804LHSOeu_bv8gHJtn5tMeowNbgq8i7Oww4mGINOerFx1g.jpeg)

## Overview

LightSwap demonstrates how ZK compression makes Solana transactions lighter and more efficient. Swap tokens with up to 98% reduction in transaction fees through zero-knowledge proofs.

## Features

- **ZK Compression**: Toggle compression on/off to see the difference
- **Token Swaps**: Exchange SOL, USDC, and BONK on Solana devnet
- **Wallet Integration**: Connect with Phantom, Solflare, or other Solana wallets
- **Transaction History**: Track your swaps with detailed compression metrics

## Quick Start

### Clone and install

\`\`\`bash
git clone https://github.com/yourusername/lightswap.git
cd lightswap
npm install
\`\`\`

### Set up environment

\`\`\`bash
echo "NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com" > .env.local
\`\`\`

### Run development server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. Connect your wallet (set to Devnet)
2. Select tokens to swap
3. Enter amount
4. Toggle ZK compression on/off
5. Click "Swap"

## Technologies

- **Frontend**: Next.js, React, Tailwind CSS
- **Blockchain**: Solana Web3.js, SPL Token
- **Wallet**: Solana Wallet Adapter
- **Compression**: Light Protocol (simulated)

## License

MIT
