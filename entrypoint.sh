#!/bin/bash

# Start Prometheus
/bin/prometheus --config.file=/etc/prometheus/prometheus.yml &

# Start Grafana
/usr/share/grafana/bin/grafana-server --homepath=/usr/share/grafana &

# Start Alertmanager
/bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml &

# Start Node app
node /app/prometheus-converter.js &

# Keep script in foreground
tail -f /dev/null
