FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p data
RUN chmod 777 data

EXPOSE 3000

ENTRYPOINT ["bun", "run", "src/index.ts"]
