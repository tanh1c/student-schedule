# syntax=docker/dockerfile:1

# ═══════════════════════════════════════════════════════════════
# STAGE 1: DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ═══════════════════════════════════════════════════════════════
# STAGE 2: RUNNER
# ═══════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Optimize Node.js for production
# (Decreases memory usage, disables verbose error messages)

# Create a non-root user for security (Best Practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure correct permissions
# (We chown the whole /app directory to the non-root user)
RUN chown -R expressjs:nodejs /app

# Switch to non-root user
USER expressjs

# Expose the listening port
EXPOSE 3001

# Start the server using the new entry point
CMD ["node", "src/server.js"]
