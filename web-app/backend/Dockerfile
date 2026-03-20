FROM node:20-slim

# Install Python for the LlamaIndex agent subprocess
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Install Python agent dependencies
COPY agent/requirements.txt agent/requirements.txt
RUN python3 -m venv /app/.agent-venv \
    && /app/.agent-venv/bin/pip install --no-cache-dir -r agent/requirements.txt

# Copy application code
COPY . .

# Ensure runtime directories exist
RUN mkdir -p uploads generated

ENV NODE_ENV=production
ENV LLAMA_AGENT_PYTHON=/app/.agent-venv/bin/python

EXPOSE 3001

CMD ["node", "server.js"]
