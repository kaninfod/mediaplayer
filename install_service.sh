#!/bin/bash
# install_service.sh - Automated install and systemd setup for Jukebox Mediaplayer Frontend
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_FILE="jukebox-mediaplayer.service"
NODE_BIN="$(which node)"
SERVE_BIN="$(which serve)"

if [ -z "$NODE_BIN" ]; then
  echo "Node.js is not installed. Please install Node.js first."
  exit 1
fi

if [ -z "$SERVE_BIN" ]; then
  echo "Installing 'serve' globally..."
  npm install -g serve
fi

cd "$APP_DIR"
echo "Installing dependencies..."
npm install

echo "Building production bundle..."
npm run build

# Copy systemd service file
if [ ! -f "$SERVICE_FILE" ]; then
  cat <<EOF > $SERVICE_FILE
[Unit]
Description=Jukebox Mediaplayer Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=$(which serve) -s dist -l 3000 --proxy https://your-backend-domain-or-ip:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
  echo "Created $SERVICE_FILE. Please edit WorkingDirectory and ExecStart as needed."
fi

sudo cp "$SERVICE_FILE" /etc/systemd/system/jukebox-mediaplayer.service
sudo systemctl daemon-reload
sudo systemctl enable jukebox-mediaplayer
sudo systemctl restart jukebox-mediaplayer

echo "Jukebox Mediaplayer Frontend installed and running as a service!"
echo "Visit http://localhost:3000 or your server's IP."
