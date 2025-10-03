#!/bin/bash
# install_service.sh - Automated install and systemd setup for Jukebox Mediaplayer Frontend
set -ex

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_FILE="jukebox-mediaplayer.service"

NODE_BIN="$(which node)"
SERVE_BIN="$(which serve)"

# Check Node.js version (require <= 20.x)
NODE_VERSION=$($NODE_BIN --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 21 ]; then
  echo "\nERROR: Node.js version $NODE_VERSION detected. Many frontend tools are not compatible with Node.js 21+ as of 2025."
  echo "Please downgrade to Node.js 20.x (LTS) before continuing."
  echo "Recommended (nvm):"
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "  source ~/.bashrc"
  echo "  nvm install 20"
  echo "  nvm use 20"
  echo "  nvm alias default 20"
  echo "Or (NodeSource):"
  echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  exit 1
fi

if [ -z "$NODE_BIN" ]; then
  echo "Node.js is not installed. Please install Node.js first."
  exit 1
fi


# Check for TypeScript compiler
TSC_BIN="$(which tsc || true)"
if [ -z "$SERVE_BIN" ]; then
  echo "Installing 'serve' globally..."
  npm install -g serve
fi
if [ -z "$TSC_BIN" ]; then
  echo "Installing 'typescript' locally..."
  npm install --save-dev typescript
fi

# Raspberry Pi 4 notes
if grep -q 'Raspberry Pi' /proc/cpuinfo 2>/dev/null; then
  echo "Detected Raspberry Pi."
  echo "If you encounter memory issues during build, increase swap:"
  echo "  sudo dphys-swapfile swapoff && sudo dphys-swapfile set 2048 && sudo dphys-swapfile swapon"
  echo "Consider using Node.js LTS (v18+) from NodeSource or nvm for ARM."
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
ExecStart=$(which serve) -s dist -l tcp://0.0.0.0:80
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
echo "Visit http://<your-server-ip>/ in your browser. (Now served on port 80)"
