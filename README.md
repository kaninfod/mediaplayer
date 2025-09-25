# Jukebox Mediaplayer Frontend

This project is a React (Vite) frontend for the Jukebox CMP backend. It provides a modern, responsive UI for controlling playback, browsing artists/albums/songs, and interacting with your jukebox system.

## Features
- Modern React + TypeScript + Ant Design UI
- Real-time playback controls
- Browse and play artists, albums, and songs
- Works with the CMP backend API
- Production-ready static build
- Easy deployment with NPM reverse proxy
- Systemd service integration for backend

---

## Prerequisites
- Node.js (v18+ recommended)
- NPM (v9+ recommended)
- Git
- CMP backend running and accessible

---

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/jukebox-mediaplayer.git
cd jukebox-mediaplayer
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure API Endpoint
- Edit `.env.production` (create if missing):
  ```env
  VITE_API_BASE=https://your-backend-domain-or-ip:8000
  ```
- Make sure the API base matches your backend deployment.

### 4. Build the Production Bundle
```sh
npm run build
```
- This creates a `dist/` directory with static files.

### 5. Serve the App with NPM Reverse Proxy
- Install the `serve` package globally if you haven't (use `sudo` for system-wide install):
  ```sh
  sudo npm install -g serve
  ```
- Start the static server with reverse proxy to backend API:
  ```sh
  serve -s dist -l 3000 --proxy https://your-backend-domain-or-ip:8000
  ```
- The app will be available at `http://localhost:3000` (or your chosen port).

**Troubleshooting:**
- If you get a `command not found: serve` error, make sure your npm global bin directory (often `/usr/local/bin` or `/usr/bin`) is in your `PATH`.
- You can check with `echo $PATH` and `npm bin -g`.

---

## Automated Installation Script

You can use the provided `install_service.sh` script to automate installation and setup as a systemd service.

### Usage
```sh
chmod +x install_service.sh
sudo ./install_service.sh
```
- This will:
  - Install dependencies
  - Build the app
  - Set up a systemd service to run the frontend with `serve`

---

## Systemd Service

A sample service file `jukebox-mediaplayer.service` is provided:

```
[Unit]
Description=Jukebox Mediaplayer Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/jukebox-mediaplayer
ExecStart=/usr/bin/serve -s dist -l 3000 --proxy https://your-backend-domain-or-ip:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

- Edit `WorkingDirectory` and `ExecStart` as needed.
- Copy to `/etc/systemd/system/jukebox-mediaplayer.service` and enable:
  ```sh
  sudo systemctl daemon-reload
  sudo systemctl enable jukebox-mediaplayer
  sudo systemctl start jukebox-mediaplayer
  ```

---

## Updating
To update the app:
```sh
git pull
npm install
npm run build
sudo systemctl restart jukebox-mediaplayer
```

---

## Troubleshooting
- Ensure the backend API is reachable from the frontend server.
- Check `.env.production` and service file for correct API URLs.
- Use `journalctl -u jukebox-mediaplayer` to view service logs.

---

## License
MIT
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
