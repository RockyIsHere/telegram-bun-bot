FROM oven/bun:1 AS base
WORKDIR /app

# Install yt-dlp and ffmpeg (needed for /yt command)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
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
