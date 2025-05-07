# LightSwap

A minimalist token swap interface for Solana, demonstrating the power of ZK compression.

![LightSwap Screenshot](https://sjc.microlink.io/Fh_-S6f30O_4IpYbq_ZGtuir82LgEmGmyeuPIj92804LHSOeu_bv8gHJtn5tMeowNbgq8i7Oww4mGINOerFx1g.jpeg)

## Live Demo

Check out the live demo at [lightswap.vercel.app](https://lightswap.vercel.app/)

## Project Overview

LightSwap is a demonstration of how ZK compression can make Solana transactions lighter and more efficient. The application provides a clean, intuitive interface for swapping tokens on Solana with ZK compression enabled.

## Development Journey

Here's how we built LightSwap step by step:

### 1. Project Setup

- Created a Next.js application with TypeScript
- Set up Tailwind CSS for styling
- Configured environment variables for Solana RPC endpoints
- Added necessary dependencies for Solana web3.js and SPL tokens

\`\`\`bash
npx create-next-app@latest lightswap --typescript

cd lightswap
npm install @solana/web3.js @solana/spl-token
\`\`\`

### 2. UI Components Development

- Designed a clean, dark-themed UI with a focus on simplicity
- Created the token selector component with token icons and balances
- Implemented the swap interface with from/to fields
- Added slippage tolerance settings (0.1%, 0.5%, 1%, Custom)
- Built the transaction history component
- Designed the wallet connection button

### 3. Solana Integration

- Set up Solana connection utilities
- Implemented wallet adapter integration
- Created token balance fetching functionality
- Added SOL and USDC token data

### 4. ZK Compression Implementation

- Added ZK compression toggle
- Implemented mock ZK compression client for demonstration
- Created compression visualization utilities
- Added transaction simulation with compression metrics

### 5. Swap Functionality

- Implemented token swap logic
- Added slippage calculation
- Created transaction building utilities
- Implemented swap confirmation flow
- Added success/error handling

## Key Features

- **ZK Compression Toggle**: Enable/disable ZK compression for transactions
- **Token Selection**: Swap between SOL and USDC (demo tokens)
- **Slippage Settings**: Customize slippage tolerance
- **Wallet Connection**: Connect to Solana wallets
- **Devnet Support**: Test on Solana devnet


### Integration

- **Solana Connection**: Web3.js for Solana blockchain interaction
- **Wallet Adapter**: Solana wallet adapter for wallet connections
- **Token Handling**: SPL Token library for token operations
- **ZK Compression**: Custom implementation for demonstration


## Future Improvements
- Add more token pairs
- Implement real swap functionality with Jupiter or other DEX aggregators
- Add transaction confirmation and details view
- Implement token search functionality
- Add price impact warnings


   ## Resources

- [ZK Compression Documentation](https://www.zkcompression.com/developers/addresses-and-urls)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Helius RPC Documentation](https://docs.helius.dev/)

## License

MIT
\`\`\`

This README provides a comprehensive overview of how we built the LightSwap demo application, including the step-by-step development process, key features, technical implementation details, and the project structure. It also includes information about the animation we implemented to visualize the "Solana is now Lighter" concept.

The document is structured to be easy to follow for developers who want to understand how the application was built or contribute to it in the future.


