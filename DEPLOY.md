# Deploying Financia DApp to AWS Amplify

This guide provides step-by-step instructions for deploying the Financia DApp to AWS Amplify.

## Prerequisites

- An AWS account
- Git repository with your Financia DApp code
- AWS CLI installed (optional, for advanced configuration)

## Deployment Steps

### 1. Prepare Your Environment Variables

Before deploying, make sure you have the correct environment variables set up:

1. Create a `.env` file based on the `.env.example` template
2. Set the correct `REACT_APP_CONTRACT_ADDRESS` for your deployed smart contract

### 2. Log in to AWS Management Console

1. Go to [AWS Management Console](https://aws.amazon.com/console/)
2. Sign in with your AWS account

### 3. Navigate to AWS Amplify

1. Search for "Amplify" in the AWS services search bar
2. Select "AWS Amplify" from the results

### 4. Create a New Amplify App

1. Click "New app" in the top-right corner
2. Select "Host web app"

### 5. Connect to Your Repository

1. Choose your Git provider (GitHub, BitBucket, GitLab, or AWS CodeCommit)
2. Authorize AWS Amplify to access your repositories
3. Select the repository containing your Financia DApp
4. Select the branch you want to deploy (usually `main` or `master`)

### 6. Configure Build Settings

1. Review the auto-detected build settings
2. The existing `amplify.yml` file in your project should be automatically detected
3. If needed, you can modify the build settings in the console

### 7. Add Environment Variables

1. Expand the "Advanced settings" section
2. Scroll to the "Environment variables" section
3. Add the following environment variables:
   - Key: `REACT_APP_CONTRACT_ADDRESS`
   - Value: Your deployed contract address (e.g., `0x123456789abcdef123456789abcdef123456789a`)
4. Add any other environment variables from your `.env` file that are needed for production

### 8. Save and Deploy

1. Click "Save and deploy"
2. AWS Amplify will now build and deploy your application
3. You can monitor the build progress in the Amplify console

### 9. Access Your Deployed Application

1. Once the deployment is complete, Amplify will provide a URL to access your application
2. The URL will be in the format: `https://branch-name.app-id.amplifyapp.com`

## Troubleshooting

### Blank Pages on Direct Route Access

If you encounter blank pages when accessing routes directly (e.g., `/market`), the issue is likely related to client-side routing. AWS Amplify should handle this automatically with the following settings:

1. Go to your app in the Amplify console
2. Navigate to "Rewrites and redirects"
3. Add a new rewrite rule:
   - Source address: `</^[^.]+$|\.((?!css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json).*$)>/`
   - Target address: `/index.html`
   - Type: `200 (Rewrite)`

This rule ensures that all routes are properly handled by React Router.

### MetaMask Connection Issues

If MetaMask isn't connecting in production:

1. Ensure your site is using HTTPS (AWS Amplify provides this by default)
2. Check browser console for any errors
3. Verify that the correct network (Sepolia testnet) is selected in MetaMask

## Custom Domain Setup (Optional)

1. In the Amplify console, go to your app
2. Select "Domain management"
3. Click "Add domain"
4. Follow the instructions to set up your custom domain

## Continuous Deployment

AWS Amplify automatically sets up continuous deployment. Any changes pushed to your connected branch will trigger a new build and deployment.

## Monitoring and Logs

1. In the Amplify console, go to your app
2. Select "Hosting" > "Build history"
3. Click on any build to view detailed logs

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [React Router with AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html#redirects-for-single-page-web-apps-spa)