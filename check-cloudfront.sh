#!/bin/bash

# CloudFront Status Check Script
# This script checks the deployment status of your CloudFront distribution

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}☁️  CloudFront Deployment Status Check${NC}"
echo "=========================================="

# Check if cloudfront-info.json exists
if [ ! -f "cloudfront-info.json" ]; then
    echo -e "${RED}❌ CloudFront info file not found${NC}"
    echo -e "${YELLOW}💡 Run './setup-env.sh cloudfront' to create distribution${NC}"
    exit 1
fi

# Get distribution ID from config
DISTRIBUTION_ID=$(grep -o '"distributionId": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)
DOMAIN_NAME=$(grep -o '"domainName": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${RED}❌ Distribution ID not found in config${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Distribution Details:${NC}"
echo "  ID: $DISTRIBUTION_ID"
echo "  Domain: $DOMAIN_NAME"

# Check distribution status
echo -e "\n${YELLOW}🔄 Checking deployment status...${NC}"
STATUS=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${BLUE}📊 Current Status: $STATUS${NC}"
    
    if [ "$STATUS" = "Deployed" ]; then
        echo -e "${GREEN}✅ CloudFront distribution is deployed and ready!${NC}"
        echo -e "${BLUE}🌍 Your CDN URL: https://$DOMAIN_NAME${NC}"
        
        # Test the CDN URL
        echo -e "\n${YELLOW}🧪 Testing CDN accessibility...${NC}"
        if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME" | grep -q "200"; then
            echo -e "${GREEN}✅ CDN is accessible and responding${NC}"
        else
            echo -e "${YELLOW}⚠️  CDN may still be deploying or have issues${NC}"
        fi
        
    else
        echo -e "${YELLOW}⏳ Distribution is still being deployed...${NC}"
        echo -e "${BLUE}💡 This usually takes 5-10 minutes${NC}"
        echo -e "${BLUE}🔄 Run this script again in a few minutes${NC}"
    fi
else
    echo -e "${RED}❌ Failed to get distribution status${NC}"
    echo -e "${YELLOW}💡 Check your AWS permissions or try again later${NC}"
fi

# Show invalidation status
echo -e "\n${YELLOW}📋 Recent Invalidations:${NC}"
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID --query 'InvalidationList.Items[0:3].{Id:Id,Status:Status,CreateTime:CreateTime}' --output table 2>/dev/null

echo -e "\n${BLUE}✨ Status check complete!${NC}"
