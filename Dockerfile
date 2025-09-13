FROM --platform=$BUILDPLATFORM node:23.6.1-bullseye-slim as builder

# Build arguments for environment configuration
ARG API_BASE_URL
ARG ANGULAR_CONFIGURATION=production

RUN mkdir /greenhouse_web
WORKDIR /greenhouse_web

RUN npm install -g @angular/cli@19

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Update environment file with build-time API URL if provided
RUN if [ ! -z "$API_BASE_URL" ]; then \
      if [ "$ANGULAR_CONFIGURATION" = "staging" ]; then \
        sed -i "s|baseUrl: ''|baseUrl: '$API_BASE_URL'|g" src/environments/environment.staging.ts; \
      else \
        sed -i "s|baseUrl: 'http://localhost:5100'|baseUrl: '$API_BASE_URL'|g" src/environments/environment.ts; \
      fi \
    fi

# Build the Angular application
RUN ng build --configuration=$ANGULAR_CONFIGURATION

# Production stage with nginx
FROM nginx:alpine as production

# Copy built application from builder stage
COPY --from=builder /greenhouse_web/dist/greenhouse_web /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Development stage (keeping the original dev setup)
FROM builder as dev-envs

RUN apt-get update && \
    apt-get install -y --no-install-recommends git

RUN useradd -s /bin/bash -m vscode && \
groupadd docker && \
usermod -aG docker vscode 

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]