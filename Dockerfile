# bansal
# CrimeSync Multi-Stage Production Build: React/Vite Frontend Web App
# Author: Rajesh Bansal

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci --silent

# Copy source code and compile production bundle
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS frontend-production
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Custom Nginx configuration with API proxy pass and security headers
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://crimesync-backend:5000/api/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
