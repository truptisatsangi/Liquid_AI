/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_LIQUIDITY_VAULT_ADDRESS: process.env.LIQUIDITY_VAULT_ADDRESS,
    NEXT_PUBLIC_ENVIO_API_URL: process.env.ENVIO_API_URL || 'http://localhost:3001/graphql',
    NEXT_PUBLIC_CHAIN_ID: process.env.CHAIN_ID || '11155111',
    NEXT_PUBLIC_RPC_URL: process.env.SEPOLIA_RPC_URL,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
