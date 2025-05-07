"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZapIcon, FileIcon, CoinsIcon, BarChart3Icon, CodeIcon, LightbulbIcon } from "lucide-react"

export function ZkCompressionExplainer() {
  const [activeTab, setActiveTab] = useState("what")

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ZapIcon className="h-5 w-5 text-purple-400 mr-2" />
          ZK Compression for Token Swaps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="what" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="what">Overview</TabsTrigger>
            <TabsTrigger value="how">Technical</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="innovation">Innovation</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="space-y-4">
            <h3 className="text-lg font-medium">Overview</h3>
            <p>
              This application demonstrates how ZK compression can revolutionize token swaps on Solana. By compressing
              token account data using zero-knowledge proofs, we achieve up to 50x reduction in on-chain storage while
              maintaining the same security guarantees.
            </p>
            <div className="bg-zinc-900 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">Key Features:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Seamless integration with Jupiter for optimal swap routing</li>
                <li>Up to 98% reduction in transaction fees through ZK compression</li>
                <li>Detailed compression metrics for each transaction</li>
                <li>Toggle between compressed and standard transactions</li>
                <li>Comprehensive transaction history with compression analytics</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="how" className="space-y-4">
            <h3 className="text-lg font-medium">How It Works</h3>
            <p>This application implements a novel three-step process for compressed token swaps:</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-2 mb-4">
              <div className="bg-zinc-900 p-2 rounded">1. Decompress Token</div>
              <div className="bg-zinc-900 p-2 rounded">2. Swap via Jupiter</div>
              <div className="bg-zinc-900 p-2 rounded">3. Compress Result</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <CodeIcon className="h-4 w-4 text-purple-400 mr-2" />
                Implementation Details:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Uses Light Protocol's ZK compression infrastructure</li>
                <li>Integrates with Helius RPC endpoints for compressed token support</li>
                <li>Implements custom transaction building for compressed token operations</li>
                <li>Calculates real-time compression metrics for each transaction</li>
                <li>Provides detailed analytics on gas and storage savings</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <h3 className="text-lg font-medium">Key Benefits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileIcon className="h-4 w-4 text-purple-400 mr-2" />
                  <h4 className="font-medium">Reduced Storage</h4>
                </div>
                <p className="text-sm">
                  Up to 50x smaller on-chain footprint, dramatically reducing Solana's state bloat.
                </p>
              </div>
              <div className="bg-zinc-900 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <CoinsIcon className="h-4 w-4 text-purple-400 mr-2" />
                  <h4 className="font-medium">Lower Costs</h4>
                </div>
                <p className="text-sm">98% reduction in transaction fees makes DeFi accessible to more users.</p>
              </div>
              <div className="bg-zinc-900 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3Icon className="h-4 w-4 text-purple-400 mr-2" />
                  <h4 className="font-medium">Higher Throughput</h4>
                </div>
                <p className="text-sm">
                  More transactions per block increases Solana's effective TPS for token operations.
                </p>
              </div>
              <div className="bg-zinc-900 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <ZapIcon className="h-4 w-4 text-purple-400 mr-2" />
                  <h4 className="font-medium">Same Security</h4>
                </div>
                <p className="text-sm">Zero-knowledge proofs ensure the same security as uncompressed transactions.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="innovation" className="space-y-4">
            <h3 className="text-lg font-medium">Innovation Highlights</h3>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <LightbulbIcon className="h-4 w-4 text-yellow-400 mr-2" />
                What Makes This Unique:
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong className="text-purple-300">First-of-its-kind Integration:</strong> Pioneering the combination
                  of ZK compression with Jupiter's swap infrastructure
                </li>
                <li>
                  <strong className="text-purple-300">Real-time Compression Metrics:</strong> Transparent display of
                  compression benefits for each transaction
                </li>
                <li>
                  <strong className="text-purple-300">Seamless UX:</strong> Users can toggle compression on/off without
                  changing their swap workflow
                </li>
                <li>
                  <strong className="text-purple-300">Educational Component:</strong> Built-in tools to help users
                  understand ZK compression benefits
                </li>
                <li>
                  <strong className="text-purple-300">Ecosystem Impact:</strong> Demonstrates how ZK compression can be
                  applied to existing DeFi primitives
                </li>
              </ul>
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              This application demonstrates how ZK compression can be integrated into everyday DeFi operations,
              providing a blueprint for other applications to follow.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
