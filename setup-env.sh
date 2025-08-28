#!/bin/bash

# Environment Setup Script for Weighing App
# This script helps manage environment variables for different deployment environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="weighingapp-frontend-493354280981"
REGION="ap-south-1"

show_help() {
    echo -e "${BLUE}Environment Setup Script for Weighing App${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  setup [env]     - Set up environment variables for specified environment"
    echo "  build [env]     - Build with specific environment"
    echo "  deploy [env]    - Deploy with specific environment"
    echo "  cloudfront      - Create CloudFront distribution (requires AWS permissions)"
    echo "  invalidate      - Invalidate CloudFront cache"
    echo "  help            - Show this help message"
    echo ""
    echo "Environments:"
    echo "  local           - Local development"
    echo "  staging         - Staging environment"
    echo "  production      - Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 setup production"
    echo "  $0 build staging"
    echo "  $0 deploy production"
    echo "  $0 cloudfront"
}

setup_environment() {
    local env=$1
    
    case $env in
        "local")
            echo -e "${YELLOW}Setting up local environment...${NC}"
            cp env.local .env
            echo -e "${GREEN}✅ Local environment configured${NC}"
            echo -e "${BLUE}API URL: http://localhost:3000/api${NC}"
            ;;
        "staging")
            echo -e "${YELLOW}Setting up staging environment...${NC}"
            cp env.staging .env
            echo -e "${GREEN}✅ Staging environment configured${NC}"
            echo -e "${BLUE}API URL: https://staging-api.your-domain.com/api${NC}"
            ;;
        "production")
            echo -e "${YELLOW}Setting up production environment...${NC}"
            cp env.production .env
            echo -e "${GREEN}✅ Production environment configured${NC}"
            echo -e "${BLUE}API URL: https://your-api-domain.com/api${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $env${NC}"
            echo "Valid environments: local, staging, production"
            exit 1
            ;;
    esac
}

build_with_env() {
    local env=$1
    
    echo -e "${YELLOW}Building for $env environment...${NC}"
    setup_environment $env
    
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Building application...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build completed successfully for $env!${NC}"
    else
        echo -e "${RED}❌ Build failed!${NC}"
        exit 1
    fi
}

deploy_with_env() {
    local env=$1
    
    echo -e "${YELLOW}Deploying to $env environment...${NC}"
    build_with_env $env
    
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
        echo -e "${YELLOW}🌍 Your application is available at:${NC}"
        echo -e "${GREEN}http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com${NC}"
    else
        echo -e "${RED}❌ Deployment failed!${NC}"
        exit 1
    fi
}

create_cloudfront() {
    echo -e "${YELLOW}Creating CloudFront distribution...${NC}"
    echo -e "${BLUE}Note: This requires CloudFront permissions in your AWS account${NC}"
    
    if aws cloudfront create-distribution --distribution-config file://cloudfront-config.json; then
        echo -e "${GREEN}✅ CloudFront distribution created successfully!${NC}"
        echo -e "${YELLOW}📝 You can find your distribution ID in the AWS Console${NC}"
        echo -e "${YELLOW}🌍 Your CDN URL will be available once deployment is complete${NC}"
    else
        echo -e "${RED}❌ Failed to create CloudFront distribution${NC}"
        echo -e "${YELLOW}💡 You may need to:${NC}"
        echo -e "   1. Add CloudFront permissions to your IAM user"
        echo -e "   2. Create the distribution manually in AWS Console"
        echo -e "   3. Use the S3 website URL for now"
    fi
}

invalidate_cache() {
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    
    # Try to get distribution ID from config file
    if [ -f "cloudfront-info.json" ]; then
        DISTRIBUTION_ID=$(grep -o '"distributionId": "[^"]*"' cloudfront-info.json | cut -d'"' -f4)
        if [ -n "$DISTRIBUTION_ID" ]; then
            echo -e "${BLUE}Using distribution ID from config: $DISTRIBUTION_ID${NC}"
        else
            echo -e "${BLUE}Please enter your CloudFront Distribution ID:${NC}"
            read -p "Distribution ID: " DISTRIBUTION_ID
        fi
    else
        echo -e "${BLUE}Please enter your CloudFront Distribution ID:${NC}"
        read -p "Distribution ID: " DISTRIBUTION_ID
    fi
    
    if [ -z "$DISTRIBUTION_ID" ]; then
        echo -e "${RED}❌ Distribution ID is required${NC}"
        exit 1
    fi
    
    if aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"; then
        echo -e "${GREEN}✅ Cache invalidation initiated successfully!${NC}"
        echo -e "${YELLOW}📝 Invalidation may take 5-10 minutes to complete${NC}"
    else
        echo -e "${RED}❌ Failed to invalidate cache${NC}"
    fi
}

# Main script logic
case $1 in
    "setup")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Environment is required${NC}"
            show_help
            exit 1
        fi
        setup_environment $2
        ;;
    "build")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Environment is required${NC}"
            show_help
            exit 1
        fi
        build_with_env $2
        ;;
    "deploy")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Environment is required${NC}"
            show_help
            exit 1
        fi
        deploy_with_env $2
        ;;
    "cloudfront")
        create_cloudfront
        ;;
    "invalidate")
        invalidate_cache
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
