FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

FROM php:8.4-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-dev unzip \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-progress
COPY --from=frontend-build /app/public ./public

RUN mkdir -p database \
    && touch database/database.sqlite \
    && php -m | grep -q '^pdo_sqlite$'

CMD ["sh", "scripts/render-start.sh"]
