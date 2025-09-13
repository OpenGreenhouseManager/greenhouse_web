# Greenhouse Web

Angular web application for greenhouse monitoring and management.

## Development

### Prerequisites
- Node.js 23.x
- Angular CLI 19.x

### Setup
```bash
npm install
ng serve
```

## Docker Deployment

### Environment Configurations

The application supports three environments:
- **Development**: Local development with proxy configuration
- **Staging**: Pre-production environment
- **Production**: Production environment

### Building Docker Images

#### Development
```bash
docker build --target dev-envs -t greenhouse-web:dev .
docker run -p 4200:4200 greenhouse-web:dev
```

#### Staging
```bash
docker build --target production \
  --build-arg API_BASE_URL=https://staging-api.example.com \
  --build-arg ANGULAR_CONFIGURATION=staging \
  -t greenhouse-web:staging .
docker run -p 80:80 greenhouse-web:staging
```

#### Production
```bash
docker build --target production \
  --build-arg API_BASE_URL=https://api.example.com \
  --build-arg ANGULAR_CONFIGURATION=production \
  -t greenhouse-web:production .
docker run -p 80:80 greenhouse-web:production
```

### Docker Compose

Create a `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'
services:
  greenhouse-web-staging:
    build:
      context: .
      target: production
      args:
        - API_BASE_URL=https://staging-api.example.com
        - ANGULAR_CONFIGURATION=staging
    ports:
      - "8080:80"
    restart: unless-stopped

  greenhouse-web-production:
    build:
      context: .
      target: production
      args:
        - API_BASE_URL=https://api.example.com
        - ANGULAR_CONFIGURATION=production
    ports:
      - "80:80"
    restart: unless-stopped
```

## GitHub Actions Release

### Setup

1. **Repository Secrets**: Add the following secrets to your GitHub repository:
   - `STAGING_API_BASE_URL`: Your staging API base URL (e.g., `https://staging-api.example.com`)
   - `PROD_API_BASE_URL`: Your production API base URL (e.g., `https://api.example.com`)

2. **GitHub Container Registry**: The workflow uses GitHub Container Registry (ghcr.io). Make sure your repository has the necessary permissions.

### Creating a Release

1. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. The GitHub Actions workflow will automatically:
   - Build Docker images for both staging and production
   - Push images to GitHub Container Registry
   - Create a GitHub release with download instructions

### Using Released Images

#### Staging
```bash
docker pull ghcr.io/yourusername/greenhouse_web:v1.0.0-staging
docker run -p 8080:80 ghcr.io/yourusername/greenhouse_web:v1.0.0-staging
```

#### Production
```bash
docker pull ghcr.io/yourusername/greenhouse_web:v1.0.0-production
docker run -p 80:80 ghcr.io/yourusername/greenhouse_web:v1.0.0-production
```

### Environment Variables

The application uses the following environment configurations:

#### Staging (`environment.staging.ts`)
- `production: false`
- `baseUrl`: Set via Docker build arg `API_BASE_URL`

#### Production (`environment.ts`)
- `production: true` (automatically set by Angular build)
- `baseUrl`: Set via Docker build arg `API_BASE_URL`

## Health Check

The nginx configuration includes a health check endpoint:
```bash
curl http://localhost/health
```

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run lint`: Run linter
- `npm run prettier`: Format code
