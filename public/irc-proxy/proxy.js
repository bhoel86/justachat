/**
 * JAC IRC Proxy - WebSocket to TCP Bridge
 * Allows mIRC and other traditional IRC clients to connect to JAC
 * 
 * Environment Variables:
 *   WS_URL    - WebSocket gateway URL (default: production JAC gateway)
 *   HOST      - Host to bind to (default: 127.0.0.1, use 0.0.0.0 for public)
 *   PORT      - Port to listen on (default: 6667)
 *   LOG_LEVEL - Logging level: debug, info, warn, error (default: info)
 * 
 * Usage: 
 *   Local:  node proxy.js
 *   Public: HOST=0.0.0.0 PORT=6667 node proxy.js
 */

const net = require('net');
const WebSocket = require('ws');

// Load .env file if present
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, use process.env directly
}

// Configuration from environment
const config = {
  wsUrl: process.env.WS_URL || 'wss://hliytlezggzryetekpvo.supabase.co/functions/v1/irc-gateway',
  host: process.env.HOST || '127.0.0.1',
  port: parseInt(process.env.PORT || '6667', 10),
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Logging levels
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLogLevel = LOG_LEVELS[config.logLevel] || 1;

function log(level, ...args) {
  if (LOG_LEVELS[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}]`, ...args);
  }
}

// Track active connections
let connectionCount = 0;
const activeConnections = new Map();

const server = net.createServer((socket) => {
  const connId = ++connectionCount;
  const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  
  log('info', `[${connId}] New IRC client connected from ${clientAddr}`);
  
  let ws = null;
  let buffer = '';
  let authenticated = false;
  
  activeConnections.set(connId, { socket, clientAddr, connected: new Date() });
  
  // Connect to JAC WebSocket
  try {
    ws = new WebSocket(config.wsUrl);
    
    ws.on('open', () => {
      log('info', `[${connId}] Connected to JAC IRC Gateway`);
    });
    
    ws.on('message', (data) => {
      const message = data.toString();
      log('debug', `[${connId}] [JAC->IRC]`, message.trim());
      socket.write(message);
    });
    
    ws.on('close', (code, reason) => {
      log('info', `[${connId}] JAC connection closed (code: ${code})`);
      socket.end();
    });
    
    ws.on('error', (err) => {
      log('error', `[${connId}] WebSocket error:`, err.message);
      socket.end();
    });
  } catch (err) {
    log('error', `[${connId}] Failed to connect to JAC:`, err.message);
    socket.end();
    return;
  }
  
  // Handle IRC client data
  socket.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\r\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        log('debug', `[${connId}] [IRC->JAC]`, line);
        
        // Track authentication
        if (line.startsWith('PASS ')) {
          authenticated = true;
          log('info', `[${connId}] Client authenticating...`);
        }
        
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(line);
        }
      }
    }
  });
  
  socket.on('close', () => {
    log('info', `[${connId}] IRC client disconnected from ${clientAddr}`);
    activeConnections.delete(connId);
    if (ws) ws.close();
  });
  
  socket.on('error', (err) => {
    log('error', `[${connId}] Socket error:`, err.message);
    activeConnections.delete(connId);
    if (ws) ws.close();
  });
});

// Graceful shutdown
function shutdown() {
  log('info', 'Shutting down proxy...');
  
  for (const [id, conn] of activeConnections) {
    log('info', `Closing connection ${id}`);
    conn.socket.end();
  }
  
  server.close(() => {
    log('info', 'Proxy shut down complete');
    process.exit(0);
  });
  
  // Force exit after 5 seconds
  setTimeout(() => {
    log('warn', 'Forced shutdown');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
server.listen(config.port, config.host, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('JAC IRC Proxy Started');
  console.log('='.repeat(60));
  console.log('');
  console.log('Configuration:');
  console.log(`  Host:     ${config.host}`);
  console.log(`  Port:     ${config.port}`);
  console.log(`  Gateway:  ${config.wsUrl}`);
  console.log(`  Log Level: ${config.logLevel}`);
  console.log('');
  
  if (config.host === '0.0.0.0') {
    console.log('⚠️  PUBLIC MODE - Accepting connections from any IP');
    console.log('');
    console.log('mIRC Settings (for remote users):');
    console.log('  Server: <your-server-ip>');
    console.log(`  Port: ${config.port}`);
    console.log('  Password: email@example.com:password');
  } else {
    console.log('mIRC Settings:');
    console.log(`  Server: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log('  Password: email@example.com:password');
  }
  
  console.log('');
  console.log('Waiting for connections...');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log('error', `Port ${config.port} is already in use. Close other IRC servers first.`);
  } else if (err.code === 'EADDRNOTAVAIL') {
    log('error', `Cannot bind to ${config.host}. Check your network configuration.`);
  } else {
    log('error', 'Server error:', err.message);
  }
  process.exit(1);
});
