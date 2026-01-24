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
OPTION 2: VPS/SERVER HOSTING (Public)
========================================

Host the proxy on a VPS so users can connect without 
running their own proxy.

REQUIREMENTS:
- Linux VPS (Ubuntu, Debian, etc.)
- Node.js 14+
- Open port 6667 (or custom port)

QUICK SETUP:
1. Upload proxy files to your VPS
2. Run: npm install
3. Run: HOST=0.0.0.0 node proxy.js

USING ENVIRONMENT VARIABLES:
  export WS_URL=wss://your-gateway-url
  export HOST=0.0.0.0
  export PORT=6667
  export LOG_LEVEL=info
  node proxy.js

USING .ENV FILE:
1. Copy .env.example to .env
2. Edit .env with your settings
3. Run: npm install  (includes dotenv)
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

YOUR USERS' MIRC SETTINGS:
- Server: your-vps-ip-address
- Port: 6667
- Password: their-email@example.com:their-password


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

========================================
