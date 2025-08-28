#!/bin/bash

# Environment Check Script for Weighing App
# This script checks the current environment configuration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Environment Configuration Check${NC}"
echo "=================================="

# Check if .env file exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    # Display current environment variables
    echo -e "\n${YELLOW}📋 Current Environment Variables:${NC}"
    if [ -f ".env" ]; then
        grep -E "^VITE_" .env | while read line; do
            echo "  $line"
        done
    fi
    
    # Check for API URL
    if grep -q "VITE_API_BASE_URL" .env; then
        API_URL=$(grep "VITE_API_BASE_URL" .env | cut -d'=' -f2)
        echo -e "\n${GREEN}🌐 API URL: $API_URL${NC}"
    else
        echo -e "\n${RED}❌ VITE_API_BASE_URL not found in .env${NC}"
    fi
    
    # Check environment type
    if grep -q "VITE_ENVIRONMENT" .env; then
        ENV_TYPE=$(grep "VITE_ENVIRONMENT" .env | cut -d'=' -f2)
        echo -e "${BLUE}🏷️  Environment: $ENV_TYPE${NC}"
    fi
    
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}💡 Run './setup-env.sh setup [environment]' to create one${NC}"
fi

# Check available environment files
echo -e "\n${YELLOW}📁 Available Environment Files:${NC}"
for env_file in env.*; do
    if [ -f "$env_file" ]; then
        echo "  $env_file"
    fi
done

# Check AWS configuration
echo -e "\n${YELLOW}🔧 AWS Configuration:${NC}"
if command -v aws &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI installed${NC}"
    
    # Check AWS identity
    if aws sts get-caller-identity &> /dev/null; then
        echo -e "${GREEN}✅ AWS credentials configured${NC}"
        AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)
        AWS_USER=$(aws sts get-caller-identity --query 'Arn' --output text)
        echo "  Account: $AWS_ACCOUNT"
        echo "  User: $AWS_USER"
    else
        echo -e "${RED}❌ AWS credentials not configured${NC}"
    fi
else
    echo -e "${RED}❌ AWS CLI not installed${NC}"
fi

# Check S3 bucket status
echo -e "\n${YELLOW}🪣 S3 Bucket Status:${NC}"
BUCKET_NAME="weighingapp-frontend-493354280981"
if aws s3 ls s3://$BUCKET_NAME &> /dev/null; then
    echo -e "${GREEN}✅ S3 bucket exists: $BUCKET_NAME${NC}"
    
    # Check website configuration
    if aws s3api get-bucket-website --bucket $BUCKET_NAME &> /dev/null; then
        echo -e "${GREEN}✅ Static website hosting enabled${NC}"
        echo -e "${BLUE}🌍 Website URL: http://$BUCKET_NAME.s3-website.ap-south-1.amazonaws.com${NC}"
    else
        echo -e "${RED}❌ Static website hosting not configured${NC}"
    fi
else
    echo -e "${RED}❌ S3 bucket not found: $BUCKET_NAME${NC}"
fi

# Check CloudFront distributions
echo -e "\n${YELLOW}☁️  CloudFront Status:${NC}"
if [ -f "cloudfront-info.json" ]; then
    DISTRIBUTION_ID=$(grep -o '"distributionId": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)
    DOMAIN_NAME=$(grep -o '"domainName": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)
    STATUS=$(grep -o '"status": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)
    
    if [ -n "$DISTRIBUTION_ID" ]; then
        echo -e "${GREEN}✅ CloudFront distribution found${NC}"
        echo -e "${BLUE}📋 Distribution details:${NC}"
        echo "  Distribution ID: $DISTRIBUTION_ID"
        echo "  Domain Name: $DOMAIN_NAME"
        echo "  Status: $STATUS"
        echo -e "${BLUE}🌍 CDN URL: https://$DOMAIN_NAME${NC}"
        
        # Check if distribution is deployed
        if [ "$STATUS" = "Deployed" ]; then
            echo -e "${GREEN}✅ Distribution is deployed and ready${NC}"
        else
            echo -e "${YELLOW}⏳ Distribution is still being deployed...${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  CloudFront info file found but no distribution ID${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No CloudFront distribution found for weighing app${NC}"
    echo -e "${BLUE}💡 Run './setup-env.sh cloudfront' to create one${NC}"
fi

echo -e "\n${BLUE}✨ Environment check complete!${NC}"
