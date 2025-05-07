import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Return a mock successful response
    return NextResponse.json({
      transaction: "mock_transaction_data",
      message: "Transaction created successfully",
    })
  } catch (error) {
    console.error("Error in swap route:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
