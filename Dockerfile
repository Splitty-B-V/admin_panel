FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN npm ci --include=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000


CMD ["npm", "run", "dev"]
