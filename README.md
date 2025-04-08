# Financia - Web3 DeFi Application

A decentralized finance application built with React and Ethereum smart contracts.

## Project Overview

Financia is a Web3 DeFi application that allows users to:
- Connect their MetaMask wallet
- View their ETH balance
- Transfer ETH to other addresses
- View transaction history
- Monitor ETH market prices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

To create a production build:

```
npm run build
```

This will create a `build` folder with optimized production files.

## AWS Deployment Options

### Option 1: AWS Amplify (Recommended for simplicity)

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Choose "Host web app"
4. Connect to your Git repository or upload the build folder directly
5. Follow the setup wizard to deploy your application

### Option 2: S3 + CloudFront

1. Create an S3 bucket for static website hosting
2. Upload the contents of the `build` folder to the S3 bucket
3. Configure the bucket policy to allow public access
4. Set up CloudFront distribution pointing to the S3 bucket
5. Configure CloudFront to handle client-side routing (see aws-s3-deploy.json)

### Option 3: EC2 + CodeDeploy

1. Set up an EC2 instance with the CodeDeploy agent installed
2. Create a CodeDeploy application and deployment group
3. Use the provided buildspec.yml and appspec.yml files for CI/CD pipeline
4. Deploy using AWS CodePipeline or manually through CodeDeploy

## Important Configuration Notes

### Contract Address

Before deploying to production, update the contract address in `src/constants/addresses.js` with your actual deployed contract address.

### Environment Variables

For production deployments, consider using environment variables for sensitive information. Create a `.env` file for local development and use AWS Parameter Store or Secrets Manager for production.

### CORS Configuration

If you're using external APIs (like CoinGecko), ensure proper CORS configuration is in place.

## Troubleshooting

### Blank Page on Direct Route Access

If you encounter blank pages when accessing routes directly (e.g., /market), ensure your web server is configured to serve the index.html file for all routes. The provided Nginx configuration in the deployment scripts handles this.

### MetaMask Connection Issues

If MetaMask isn't connecting in production, check that your site is using HTTPS, as MetaMask requires secure connections for production environments.