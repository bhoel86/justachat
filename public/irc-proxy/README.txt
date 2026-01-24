========================================
JAC IRC Proxy v2.0
========================================

Connect mIRC, HexChat, and other IRC clients to JAC chat.


========================================
OPTION 1: LOCAL USE (Personal)
========================================

REQUIREMENTS:
- Node.js (https://nodejs.org/ - download LTS version)

SETUP:
1. Install Node.js from https://nodejs.org/
2. Double-click "install.bat"
3. Double-click "START.bat"

MIRC SETTINGS:
- Server: 127.0.0.1
- Port: 6667
- Password: your-email@example.com:your-password


========================================
OPTION 2: DOCKER (Recommended for VPS)
========================================

The easiest way to host publicly.

REQUIREMENTS:
- Docker & Docker Compose

QUICK START:
  docker-compose up -d

VIEW LOGS:
  docker-compose logs -f

STOP:
  docker-compose down

CUSTOM PORT:
Edit docker-compose.yml:
  ports:
    - "7000:6667"

BUILD & RUN MANUALLY:
  docker build -t jac-irc-proxy .
  docker run -d -p 6667:6667 --name jac-irc jac-irc-proxy

YOUR USERS' MIRC SETTINGS:
- Server: your-vps-ip-address
- Port: 6667
- Password: their-email@example.com:their-password


========================================
OPTION 3: NODE.JS ON VPS
========================================

If you prefer not to use Docker.

REQUIREMENTS:
- Linux VPS (Ubuntu, Debian, etc.)
- Node.js 14+
- Open port 6667

QUICK SETUP:
1. Upload proxy files to your VPS
2. Run: npm install
3. Run: HOST=0.0.0.0 node proxy.js

USING .ENV FILE:
1. Copy .env.example to .env
2. Edit .env with your settings
3. Run: npm install
4. Run: node proxy.js

RUNNING AS A SERVICE (systemd):
Create /etc/systemd/system/jac-irc.service:

  [Unit]
  Description=JAC IRC Proxy
  After=network.target

  [Service]
  Type=simple
  User=www-data
  WorkingDirectory=/path/to/irc-proxy
  Environment=HOST=0.0.0.0
  Environment=PORT=6667
  ExecStart=/usr/bin/node proxy.js
  Restart=on-failure

  [Install]
  WantedBy=multi-user.target

Then run:
  sudo systemctl daemon-reload
  sudo systemctl enable jac-irc
  sudo systemctl start jac-irc


========================================
ENVIRONMENT VARIABLES
========================================

WS_URL    - WebSocket gateway URL
            Default: JAC production gateway

HOST      - IP to bind to
            127.0.0.1 = local only (default)
            0.0.0.0 = public/all interfaces

PORT      - Port number (default: 6667)

LOG_LEVEL - debug, info, warn, error
            Default: info


========================================
TROUBLESHOOTING
========================================

"Port 6667 in use"
  - Another IRC server is running
  - Use a different port: PORT=6668 node proxy.js

"Cannot bind to 0.0.0.0"
  - Try running with sudo (Linux)
  - Check firewall settings

"Connection refused" (for remote users)
  - Check firewall allows port 6667
  - Verify proxy is running with HOST=0.0.0.0

"WebSocket error"
  - Check internet connection
  - Verify WS_URL is correct

View debug logs:
  LOG_LEVEL=debug node proxy.js

Docker logs:
  docker-compose logs -f

========================================
