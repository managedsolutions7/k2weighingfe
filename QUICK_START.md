# Quick Start Guide - Weighing App Deployment

## 🚀 Quick Deployment Commands

### 1. Simple Deployment (Current Setup)
```bash
./deploy.sh
```

### 2. Environment-Specific Deployment
```bash
# For production
./setup-env.sh deploy production

# For staging  
./setup-env.sh deploy staging

# For local development
./setup-env.sh setup local
```

### 3. Check Current Environment
```bash
./check-env.sh
```

## 🌍 Your Current URLs

### S3 Website (HTTP)
```
http://weighingapp-frontend-493354280981.s3-website.ap-south-1.amazonaws.com
```

### CloudFront CDN (HTTPS) - Live
```
https://d3ptj1q52uaiem.cloudfront.net
```

## 📋 Environment Management

### Available Environments
- **Local**: `env.local` - Development with localhost API
- **Staging**: `env.staging` - Testing environment  
- **Production**: `env.production` - Live environment

### Environment Variables to Update
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=Weighing App
VITE_ENVIRONMENT=production
```

## ☁️ CloudFront CDN Setup

### Option 1: Automated Setup
```bash
./setup-env.sh cloudfront
```

### Option 2: Manual AWS Console
1. Go to AWS CloudFront Console
2. Create Distribution
3. Origin: `weighingapp-frontend-493354280981.s3-website.ap-south-1.amazonaws.com`
4. Protocol: HTTP Only
5. Default Root Object: `index.html`
6. Viewer Protocol: Redirect HTTP to HTTPS

### Cache Invalidation
```bash
./setup-env.sh invalidate
```

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Quick deploy to S3 |
| `./setup-env.sh setup production` | Set production environment |
| `./setup-env.sh build staging` | Build for staging |
| `./setup-env.sh deploy production` | Deploy to production |
| `./setup-env.sh cloudfront` | Create CloudFront distribution |
| `./setup-env.sh invalidate` | Invalidate CloudFront cache |
| `./check-env.sh` | Check current configuration |

## 🛠️ Troubleshooting

### Build Issues
```bash
npm install
npm run build
```

### AWS Permission Issues
- Check IAM permissions for S3 and CloudFront
- Verify AWS credentials: `aws sts get-caller-identity`

### Environment Variables Not Loading
- Ensure `.env` file exists
- Variables must start with `VITE_`
- Restart development server after changes

### CloudFront Not Working
- Check distribution status in AWS Console
- Verify origin configuration
- Invalidate cache after updates

## 📞 Support

- **Current Status**: ✅ S3 Deployed, ✅ CloudFront Created (Deploying)
- **Distribution ID**: EYD7TGK2UE4BG
- **Next Steps**: Wait for CloudFront deployment to complete (5-10 minutes)
- **API Integration**: Update `VITE_API_BASE_URL` with your backend URL

## 🔐 Security Notes

- S3 bucket is publicly accessible (required for static hosting)
- CloudFront provides HTTPS and additional security
- Use environment-specific API endpoints
- Consider AWS Secrets Manager for sensitive data
