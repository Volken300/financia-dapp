# AWS Deployment Script for Financia DApp

# Parameters
param (
    [string]$DeploymentType = "amplify",  # Options: amplify, s3, ec2
    [string]$BucketName = "financia-dapp",
    [string]$Region = "us-east-1"
)

# Check if AWS CLI is installed
try {
    aws --version
} catch {
    Write-Host "AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Build the React application
Write-Host "Building the React application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

# Deploy based on the selected deployment type
switch ($DeploymentType) {
    "amplify" {
        Write-Host "Deploying to AWS Amplify..." -ForegroundColor Green
        # Check if Amplify CLI is installed
        try {
            amplify --version
        } catch {
            Write-Host "AWS Amplify CLI is not installed. Installing..." -ForegroundColor Yellow
            npm install -g @aws-amplify/cli
        }
        
        # Initialize Amplify if not already initialized
        if (-not (Test-Path -Path "amplify")) {
            Write-Host "Initializing Amplify..." -ForegroundColor Yellow
            amplify init
        }
        
        # Add hosting
        amplify add hosting
        
        # Publish
        amplify publish
    }
    "s3" {
        Write-Host "Deploying to AWS S3 and CloudFront..." -ForegroundColor Green
        
        # Check if bucket exists, create if not
        $bucketExists = aws s3api head-bucket --bucket $BucketName 2>$null
        
        if (-not $bucketExists) {
            Write-Host "Creating S3 bucket: $BucketName" -ForegroundColor Yellow
            aws s3api create-bucket --bucket $BucketName --region $Region
            
            # Enable website hosting
            aws s3 website s3://$BucketName/ --index-document index.html --error-document index.html
            
            # Set bucket policy for public access
            $policy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
            
            $policy | Out-File -FilePath "bucket-policy.json" -Encoding utf8
            aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json
            Remove-Item -Path "bucket-policy.json"
        }
        
        # Sync build folder to S3
        Write-Host "Uploading files to S3..." -ForegroundColor Yellow
        aws s3 sync build/ s3://$BucketName/ --delete
        
        # Output the website URL
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Website URL: http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
    }
    "ec2" {
        Write-Host "Deploying to AWS EC2 using CodeDeploy..." -ForegroundColor Green
        
        # Create a deployment bundle
        Write-Host "Creating deployment bundle..." -ForegroundColor Yellow
        Compress-Archive -Path build\*, appspec.yml, scripts\* -DestinationPath financia-deploy.zip -Force
        
        # Upload to S3 (assuming a deployment bucket exists)
        $deployBucket = "$BucketName-deploy"
        $bucketExists = aws s3api head-bucket --bucket $deployBucket 2>$null
        
        if (-not $bucketExists) {
            Write-Host "Creating deployment bucket: $deployBucket" -ForegroundColor Yellow
            aws s3api create-bucket --bucket $deployBucket --region $Region
        }
        
        Write-Host "Uploading deployment bundle to S3..." -ForegroundColor Yellow
        aws s3 cp financia-deploy.zip s3://$deployBucket/
        
        # Create CodeDeploy application if it doesn't exist
        Write-Host "Setting up CodeDeploy..." -ForegroundColor Yellow
        aws deploy create-application --application-name financia-app --compute-platform Server
        
        # Create deployment group
        # Note: This assumes you have already set up EC2 instances with the CodeDeploy agent
        aws deploy create-deployment-group --application-name financia-app --deployment-group-name financia-deploy-group --service-role-arn arn:aws:iam::ACCOUNT_ID:role/CodeDeployServiceRole
        
        # Create deployment
        aws deploy create-deployment --application-name financia-app --deployment-group-name financia-deploy-group --s3-location bucket=$deployBucket,key=financia-deploy.zip,bundleType=zip
        
        Write-Host "Deployment initiated. Check the AWS CodeDeploy console for status." -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid deployment type. Options: amplify, s3, ec2" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Deployment process completed!" -ForegroundColor Green