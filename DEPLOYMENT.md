# Deployment Guide

## AWS S3 Static Website Hosting with CloudFront CDN

This guide explains how to deploy the Weighing App frontend to AWS S3 with optional CloudFront CDN.

### Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   aws sts get-caller-identity
   ```

2. **Node.js and npm installed**
   ```bash
   node --version
   npm --version
   ```

### Quick Deployment

Use the provided deployment script:

```bash
./deploy.sh
```

### Environment Management

The project includes environment-specific configuration files:

- `env.local` - Local development
- `env.staging` - Staging environment  
- `env.production` - Production environment

#### Using Environment Setup Script

```bash
# Set up environment variables
./setup-env.sh setup production

# Build with specific environment
./setup-env.sh build staging

# Deploy with specific environment
./setup-env.sh deploy production
```

#### Manual Environment Setup

1. **Copy environment file**
   ```bash
   cp env.production .env
   ```

2. **Update API endpoints**
   Edit `.env` file with your actual API URLs:
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   VITE_APP_NAME=Weighing App
   VITE_ENVIRONMENT=production
   ```

3. **Build and deploy**
   ```bash
   npm run build
   aws s3 sync dist/ s3://weighingapp-frontend-493354280981/ --delete
   ```

### CloudFront CDN Setup

#### Option 1: Using Setup Script (Recommended)

```bash
./setup-env.sh cloudfront
```

#### Option 2: Manual Setup

1. **Create CloudFront distribution**
   ```bash
   aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
   ```

2. **Get distribution details**
   ```bash
   aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Weighing App Frontend CDN'].{Id:Id,DomainName:DomainName}"
   ```

3. **Invalidate cache after updates**
   ```bash
   ./setup-env.sh invalidate
   # Or manually:
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

#### Option 3: AWS Console Setup

1. Go to AWS CloudFront Console
2. Click "Create Distribution"
3. Origin Domain: `weighingapp-frontend-493354280981.s3-website.ap-south-1.amazonaws.com`
4. Origin Protocol: HTTP Only
5. Default Root Object: `index.html`
6. Viewer Protocol Policy: Redirect HTTP to HTTPS
7. Price Class: Use Only North America and Europe
8. Create Distribution

### Manual Deployment Steps

1. **Build the application**
   ```bash
   npm install
   npm run build
   ```

2. **Create S3 bucket (if not exists)**
   ```bash
   aws s3 mb s3://weighingapp-frontend-493354280981
   ```

3. **Enable static website hosting**
   ```bash
   aws s3 website s3://weighingapp-frontend-493354280981/ \
     --index-document index.html \
     --error-document index.html
   ```

4. **Disable public access blocks**
   ```bash
   aws s3api put-public-access-block \
     --bucket weighingapp-frontend-493354280981 \
     --public-access-block-configuration \
     "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
   ```

5. **Set bucket policy for public read access**
   ```bash
   aws s3api put-bucket-policy \
     --bucket weighingapp-frontend-493354280981 \
     --policy '{
       "Version":"2012-10-17",
       "Statement":[{
         "Effect":"Allow",
         "Principal":"*",
         "Action":"s3:GetObject",
         "Resource":"arn:aws:s3:::weighingapp-frontend-493354280981/*"
       }]
     }'
   ```

6. **Upload build files**
   ```bash
   aws s3 sync dist/ s3://weighingapp-frontend-493354280981/ --delete
   ```

### Access Your Application

#### S3 Website URL (HTTP)
```
http://weighingapp-frontend-493354280981.s3-website.ap-south-1.amazonaws.com
```

#### CloudFront CDN URL (HTTPS)
```
https://[DISTRIBUTION_ID].cloudfront.net
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `https://api.yourdomain.com` |
| `VITE_APP_NAME` | Application name | `Weighing App` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_ENVIRONMENT` | Environment name | `production` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_SENTRY_DSN` | Sentry error tracking | `https://...` |

### Troubleshooting

1. **Build errors**: Check TypeScript compilation with `npm run build`
2. **Upload errors**: Verify AWS credentials and permissions
3. **Access denied**: Check bucket policy and public access settings
4. **404 errors**: Ensure index.html is in the root of the bucket
5. **CloudFront not working**: Check distribution status and cache invalidation
6. **Environment variables not loading**: Ensure `.env` file exists and variables start with `VITE_`

### Security Considerations

- The S3 bucket is configured for public read access
- CloudFront provides HTTPS and additional security layers
- Implement proper CORS headers if needed
- Use environment-specific API endpoints
- Consider using AWS Secrets Manager for sensitive variables

### Cost Optimization

- S3 storage costs are minimal for static websites
- CloudFront can reduce bandwidth costs
- Consider setting up lifecycle policies for old versions
- Use appropriate CloudFront price class for your region

### IAM Permissions Required

For full automation, your IAM user needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::weighingapp-frontend-*",
        "arn:aws:s3:::weighingapp-frontend-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:*"
      ],
      "Resource": "*"
    }
  ]
}
```
