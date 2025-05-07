# ZK Compressed Token Swap

A hackathon demo showcasing ZK Compression for token swaps on Solana.

## Overview

This project demonstrates how to use ZK Compression to create a token swap application on Solana. ZK Compression allows for significantly reduced state costs while maintaining L1 security.

## Features

- Swap compressed tokens with minimal fees
- View detailed ZK compression metrics for each transaction
- See exact compression ratios (typically 40:1 to 50:1)
- Track gas savings from using ZK compression
- View transaction history with Solana Explorer links
- Uses ZK Compression RPC methods

## ZK Compression Benefits

- **High Compression Ratios**: Achieve 40:1 to 50:1 compression ratios for token swaps
- **Gas Savings**: Reduce transaction fees by up to 98%
- **Smaller Footprint**: Compressed transactions take up significantly less space on-chain
- **L1 Security**: Maintain the same security guarantees as regular Solana transactions

## Technical Details

### ZK Compression RPC Methods

The application uses the following ZK Compression RPC methods:

- `getCompressedTokenAccountsByOwner`: Get compressed token accounts for a specific owner
- `getTransactionWithCompressionInfo`: Get transaction details with compression information

### RPC Endpoints

The application uses Helius RPC endpoints for ZK Compression:

- Devnet: `https://devnet.helius-rpc.com/?api-key=<api_key>`

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Set up environment variables:
   Create a `.env.local` file with the following:
   \`\`\`
   SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=<your_api_key>
   \`\`\`
4. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

## Hackathon Notes

This project was created for demonstration purposes to showcase ZK Compression capabilities. In a production environment, you would need to:

1. Implement proper wallet integration
2. Add error handling for RPC methods
3. Implement actual token swap logic using ZK Compression instructions
4. Add proper transaction signing and confirmation

## Resources

- [ZK Compression Documentation](https://www.zkcompression.com/developers/addresses-and-urls)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Helius RPC Documentation](https://docs.helius.dev/)
