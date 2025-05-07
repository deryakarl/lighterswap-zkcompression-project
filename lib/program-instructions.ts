import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import * as borsh from "borsh"

// Program ID for our compressed token swap program
export const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")

// Light Protocol Program ID
export const LIGHT_PROTOCOL_PROGRAM_ID = new PublicKey("LightV1111111111111111111111111111111111111")

export interface SwapCompressedTokensParams {
  userAuthority: PublicKey
  fromCompressedToken: PublicKey
  toCompressedToken: PublicKey
  fromDecompressedToken: PublicKey
  toDecompressedToken: PublicKey
  protocolTokenAccount: PublicKey
  protocolAuthority: PublicKey
  amountIn: number
  minimumAmountOut: number
}

// Define the instruction data layout
class SwapCompressedTokensLayout {
  amountIn: number
  minimumAmountOut: number

  constructor(props: { amountIn: number; minimumAmountOut: number }) {
    this.amountIn = props.amountIn
    this.minimumAmountOut = props.minimumAmountOut
  }

  static schema = new Map([
    [
      SwapCompressedTokensLayout,
      {
        kind: "struct",
        fields: [
          ["amountIn", "u64"],
          ["minimumAmountOut", "u64"],
        ],
      },
    ],
  ])
}

export function createSwapCompressedTokensInstruction(params: SwapCompressedTokensParams): TransactionInstruction {
  const data = borsh.serialize(
    SwapCompressedTokensLayout.schema,
    new SwapCompressedTokensLayout({
      amountIn: params.amountIn,
      minimumAmountOut: params.minimumAmountOut,
    }),
  )

  const keys = [
    { pubkey: params.userAuthority, isSigner: true, isWritable: true },
    { pubkey: params.fromCompressedToken, isSigner: false, isWritable: true },
    { pubkey: params.toCompressedToken, isSigner: false, isWritable: true },
    { pubkey: params.fromDecompressedToken, isSigner: false, isWritable: true },
    { pubkey: params.toDecompressedToken, isSigner: false, isWritable: true },
    { pubkey: params.protocolTokenAccount, isSigner: false, isWritable: true },
    { pubkey: params.protocolAuthority, isSigner: false, isWritable: false },
    { pubkey: PublicKey.default, isSigner: false, isWritable: false }, // Token Program
    { pubkey: PublicKey.default, isSigner: false, isWritable: false }, // System Program
    { pubkey: LIGHT_PROTOCOL_PROGRAM_ID, isSigner: false, isWritable: false }, // Light Protocol Program
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data,
  })
}
