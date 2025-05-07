import type { TransactionRecord } from "@/components/transaction-history"

// Generate a unique ID for transactions
export function generateTransactionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Add a minted token transaction to the history
export function addMintTransaction(
  transactions: TransactionRecord[],
  setTransactions: (transactions: TransactionRecord[]) => void,
  tokenSymbol: string,
  amount: string,
  txSignature: string,
  isCompressed = false,
): void {
  const newTransaction: TransactionRecord = {
    id: generateTransactionId(),
    timestamp: new Date(),
    fromToken: "",
    toToken: tokenSymbol,
    fromAmount: "",
    toAmount: amount,
    status: "success",
    txSignature,
    networkFee: "0.000005 SOL",
    isSimulated: true,
    isLocal: false,
    type: isCompressed ? "compress" : "mint",
  }

  setTransactions([newTransaction, ...transactions])
}

// Add a swap transaction to the history
export function addSwapTransaction(
  transactions: TransactionRecord[],
  setTransactions: (transactions: TransactionRecord[]) => void,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  toAmount: string,
  txSignature: string,
): void {
  const newTransaction: TransactionRecord = {
    id: generateTransactionId(),
    timestamp: new Date(),
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    status: "success",
    txSignature,
    networkFee: "0.000005 SOL",
    isSimulated: true,
    isLocal: false,
    type: "swap",
  }

  setTransactions([newTransaction, ...transactions])
}
