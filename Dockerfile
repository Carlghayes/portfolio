FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy config and site files
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY src/ /usr/share/nginx/html/

# Set ownership
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx

# Drop to non-root
USER appuser

# Tell Docker this container only needs port 80
EXPOSE 80

# Healthcheck — Docker will restart the container if Nginx stops responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1