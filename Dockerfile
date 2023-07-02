# Use an official Prometheus image as a parent image
FROM prom/prometheus as prometheus

# Use an official Grafana image as a parent image
FROM grafana/grafana as grafana

# Use an official Alertmanager image as a parent image
FROM prom/alertmanager as alertmanager

# Use an official Node.js image to build our app
FROM node:14 as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# The final image
FROM debian:latest


# Set environment variables for Grafana
ENV GF_SECURITY_ADMIN_USER=adm
ENV GF_SECURITY_ADMIN_PASSWORD=adm
ENV GF_USERS_ALLOW_SIGN_UP=false

# Enable anonymous access
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Editor
#ENV GF_AUTH_DISABLE_LOGIN_FORM=true

# Install Node.js in the final image
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    apt-get remove --purge -y curl && \
    apt-get -y autoclean && \
    rm -rf /var/lib/apt/lists/*


# Copy Prometheus from Prometheus parent image
COPY --from=prometheus /bin/prometheus /bin/prometheus
COPY --from=prometheus /etc/prometheus /etc/prometheus
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Copy Grafana from Grafana parent image
COPY --from=grafana /usr/share/grafana /usr/share/grafana
ENV GF_PATHS_HOME="/usr/share/grafana"

# Provisioning
COPY provisioning/datasources /usr/share/grafana/conf/provisioning/datasources
COPY provisioning/dashboards /usr/share/grafana/conf/provisioning/dashboards
ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/usr/share/grafana/conf/provisioning/dashboards/simple-dashboard.json

# Copy Alertmanager from Alertmanager parent image
COPY --from=alertmanager /bin/alertmanager /bin/alertmanager
COPY --from=alertmanager /etc/alertmanager /etc/alertmanager
COPY alertmanager.yml /etc/alertmanager/alertmanager.yml

# Copy Node app from builder image
COPY --from=builder /usr/src/app /app

# Define an entrypoint script to run the services
COPY entrypoint.sh /entrypoint.sh

# Run the script when the container launches
CMD ["/entrypoint.sh"]