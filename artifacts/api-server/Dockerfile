FROM node:20-alpine

WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy workspaces
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server

# Install pnpm
RUN npm install -g pnpm@9

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the API server so production runtime has compiled output
RUN pnpm --filter @workspace/api-server build

# Validate compiled entrypoint exists in the final image
RUN test -f /app/artifacts/api-server/dist/index.mjs

# Expose port
EXPOSE 3001

# Start the API server
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
