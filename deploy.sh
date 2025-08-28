#!/bin/bash

# Weighing App Frontend Deployment Script
# This script builds and deploys the React frontend to AWS S3

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Configuration
BUCKET_NAME="weighingapp-frontend-493354280981"
REGION="ap-south-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Building the application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}🌐 Uploading to S3...${NC}"
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload completed successfully!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}🌍 Your application is available at:${NC}"
echo -e "${GREEN}http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com${NC}"
echo ""
echo -e "${YELLOW}📝 To invalidate CloudFront cache (if using CloudFront):${NC}"
echo -e "aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
