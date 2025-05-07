"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PresentationIcon, ArrowRightIcon, ZapIcon } from "lucide-react"
import { CompressionVisualizer } from "./compression-visualizer"

export function PresentationMode() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "ZK Compressed Token Swap",
      content: (
        <div className="space-y-4">
          <p className="text-lg">A demonstration of token swaps using ZK compression on Solana</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Up to 50:1 compression ratio</li>
            <li>Significantly reduced transaction fees</li>
            <li>Same security guarantees as regular tokens</li>
            <li>Built with Light Protocol and Helius</li>
          </ul>
        </div>
      ),
    },
    {
      title: "The Problem",
      content: (
        <div className="space-y-4">
          <p>Token transactions on Solana face several challenges:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Each token account takes ~120 bytes of on-chain storage</li>
            <li>High storage costs for large-scale token operations</li>
            <li>Network congestion during high-volume periods</li>
            <li>Scalability limitations for mass token adoption</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Our Solution",
      content: (
        <div className="space-y-4">
          <p>ZK Compressed Token Swap addresses these challenges by:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Using ZK compression to reduce on-chain storage by up to 50x</li>
            <li>Maintaining the same security guarantees through zero-knowledge proofs</li>
            <li>Reducing transaction fees proportionally to the compression ratio</li>
            <li>Enabling higher throughput for token operations</li>
          </ul>
        </div>
      ),
    },
    {
      title: "ZK Compression Visualized",
      content: (
        <div className="space-y-4">
          <p>See the dramatic reduction in on-chain storage requirements:</p>
          <CompressionVisualizer originalSize={1200} compressedSize={25} animate={true} />
        </div>
      ),
    },
    {
      title: "Technical Implementation",
      content: (
        <div className="space-y-4">
          <p>Our solution leverages several key technologies:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Light Protocol:</strong> Provides the ZK compression infrastructure
            </li>
            <li>
              <strong>Helius RPC:</strong> Supports ZK compression RPC methods
            </li>
            <li>
              <strong>Solana:</strong> Underlying blockchain infrastructure
            </li>
            <li>
              <strong>Next.js:</strong> Frontend framework for the user interface
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Demo",
      content: (
        <div className="space-y-4">
          <p className="text-center text-lg">Live Demonstration</p>
          <div className="flex items-center justify-center p-8">
            <ZapIcon className="h-16 w-16 text-purple-400" />
          </div>
          <p className="text-center">Let's see ZK compressed token swaps in action!</p>
        </div>
      ),
    },
    {
      title: "Future Directions",
      content: (
        <div className="space-y-4">
          <p>Our project could be extended in several ways:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Integration with major DEXes for real token swaps</li>
            <li>Support for batch operations with ZK compression</li>
            <li>Mobile wallet integration for compressed tokens</li>
            <li>Analytics dashboard for tracking compression savings</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Thank You!",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg">Questions?</p>
          <div className="flex items-center justify-center p-4">
            <ZapIcon className="h-12 w-12 text-purple-400" />
          </div>
          <p>Built for the ZK Compression hackathon track</p>
          <p className="text-sm text-zinc-400">Sponsored by Light Protocol, Helius, and the Solana Foundation</p>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700 max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <PresentationIcon className="h-5 w-5 text-purple-400 mr-2" />
          Presentation Mode ({currentSlide + 1}/{slides.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">{slides[currentSlide].title}</h2>
          {slides[currentSlide].content}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0}>
          Previous
        </Button>
        <div className="flex space-x-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-purple-400" : "bg-zinc-600"}`}
              onClick={() => setCurrentSlide(index)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
        <Button variant="outline" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          Next <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
