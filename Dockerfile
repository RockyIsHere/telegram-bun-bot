FROM oven/bun:1 AS base
WORKDIR /app

# Install yt-dlp and ffmpeg (needed for /yt command)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip ffmpeg && \
    pip3 install --break-system-packages yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY src/ src/
COPY tsconfig.json ./

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "src/server.ts"]
