#!/bin/bash

# LiquidAI Setup Script
# This script sets up the complete LiquidAI development environment

echo "🚀 Setting up LiquidAI for ETHOnline 2025..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended: 18+"
fi

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing agent dependencies..."
cd agents && npm install && cd ..

echo "📦 Installing script dependencies..."
cd scripts && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "📦 Installing indexer dependencies..."
cd indexer && npm install && cd ..

echo "🔨 Compiling smart contracts..."
npx hardhat compile

echo "🧪 Running tests..."
npx hardhat test

echo "✅ Setup complete!"
echo ""
echo "🎯 Quick Start Commands:"
echo "  • Start frontend:     cd frontend && npm run dev"
echo "  • Start agents:       cd agents && npm start"
echo "  • Start indexer:      cd indexer && npm start"
echo "  • Deploy contracts:   node scripts/deploy.js deploy"
echo "  • Run tests:          npx hardhat test"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "📊 Indexer API will be available at: http://localhost:3001"
echo ""
echo "📚 For more information, see README.md"
echo "🎬 For demo instructions, see demo_script.md"
