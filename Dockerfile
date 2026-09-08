# syntax=docker/dockerfile:1.6
ARG NODE_IMAGE=node:22-alpine

# build stage
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV CI=1
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# 设置 UTF-8 环境，避免中文乱码
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LANGUAGE=C.UTF-8

# 先复制依赖清单，尽量命中 pnpm install 缓存层
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY patches ./patches
COPY packages/components/package.json ./packages/components/package.json
COPY packages/hooks/package.json ./packages/hooks/package.json
COPY packages/theme/package.json ./packages/theme/package.json
COPY packages/utils/package.json ./packages/utils/package.json
COPY packages/skills/package.json ./packages/skills/package.json
COPY packages/skills-cli/package.json ./packages/skills-cli/package.json

# 兼容未启用 BuildKit 的 CI 环境（shell executor/旧 Docker builder）
RUN pnpm install --frozen-lockfile

# 再复制源码（仅源码变化不触发重新安装依赖）
COPY . .

# 生成版本动态、LLMs、时间戳并构建文档产物
RUN node scripts/generate-home-releases.js \
    && node scripts/generate-llms.js \
    && node scripts/inject-timestamps.js \
    && rm -rf dist-docs && pnpm build && test -f dist-docs/index.html

FROM ${NODE_IMAGE} AS runner
# 兼容 alpine/debian 安装 nginx
RUN set -e; \
    if command -v apk >/dev/null 2>&1; then \
      apk add --no-cache nginx; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update && apt-get install -y --no-install-recommends nginx-light && rm -rf /var/lib/apt/lists/*; \
    else \
      echo "No package manager found to install nginx"; exit 1; \
    fi

# 统一 Nginx 站点配置到 /usr/share/nginx/html，并导出日志到 stdout/stderr
RUN set -e; \
    mkdir -p /run/nginx; \
    # 兼容 Alpine 与 Debian 的默认 conf 目录
    NGX_CONF_DIR="/etc/nginx/conf.d"; \
    if [ -d /etc/nginx/http.d ]; then NGX_CONF_DIR="/etc/nginx/http.d"; fi; \
    mkdir -p "$NGX_CONF_DIR"; \
    rm -f "$NGX_CONF_DIR"/* 2>/dev/null || true; \
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true; \
    printf 'server {\n\
        listen 80;\n\
        server_name _;\n\
        absolute_redirect off;\n\
        port_in_redirect off;\n\
        charset utf-8;\n\
        gzip on;\n\
        gzip_comp_level 5;\n\
        gzip_min_length 1024;\n\
        gzip_proxied any;\n\
        gzip_vary on;\n\
        gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        location = /index.html {\n\
          add_header Cache-Control "no-cache" always;\n\
        }\n\
        location / {\n\
          try_files $uri $uri/ /index.html;\n\
        }\n\
        location ~* \\.txt$ {\n\
          charset utf-8;\n\
          add_header Content-Type "text/plain; charset=utf-8";\n\
        }\n\
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
          access_log off;\n\
          add_header Cache-Control "public, max-age=2592000, immutable" always;\n\
        }\n\
      }\n' > "$NGX_CONF_DIR"/default.conf; \
    ln -sf /dev/stdout /var/log/nginx/access.log; \
    ln -sf /dev/stderr /var/log/nginx/error.log

COPY --from=builder /app/dist-docs /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
