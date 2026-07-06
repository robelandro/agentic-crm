FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p data

# Ensure the database directory is writable
RUN chmod 777 data

ENTRYPOINT ["bun", "run", "src/index.ts"]
