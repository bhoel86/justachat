/**
 * JAC IRC Proxy - WebSocket to TCP Bridge
 * Allows mIRC and other traditional IRC clients to connect to JAC
 * 
 * Usage: node proxy.js
 * Then connect mIRC to 127.0.0.1:6667
 */

const net = require('net');
const WebSocket = require('ws');

const LOCAL_PORT = 6667;
const WS_URL = 'wss://hliytlezggzryetekpvo.supabase.co/functions/v1/irc-gateway';

const server = net.createServer((socket) => {
  console.log('[+] New IRC client connected');
  
  let ws = null;
  let buffer = '';
  
  // Connect to JAC WebSocket
  try {
    ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('[+] Connected to JAC IRC Gateway');
    });
    
    ws.on('message', (data) => {
      const message = data.toString();
      console.log('[JAC->IRC]', message.trim());
      socket.write(message);
    });
    
    ws.on('close', () => {
      console.log('[-] JAC connection closed');
      socket.end();
    });
    
    ws.on('error', (err) => {
      console.error('[!] WebSocket error:', err.message);
      socket.end();
    });
  } catch (err) {
    console.error('[!] Failed to connect to JAC:', err.message);
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
        console.log('[IRC->JAC]', line);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(line);
        }
      }
    }
  });
  
  socket.on('close', () => {
    console.log('[-] IRC client disconnected');
    if (ws) ws.close();
  });
  
  socket.on('error', (err) => {
    console.error('[!] Socket error:', err.message);
    if (ws) ws.close();
  });
});

server.listen(LOCAL_PORT, '127.0.0.1', () => {
  console.log('='.repeat(50));
  console.log('JAC IRC Proxy Started');
  console.log('='.repeat(50));
  console.log('');
  console.log('mIRC Settings:');
  console.log('  Server: 127.0.0.1');
  console.log('  Port: 6667');
  console.log('  Password: your-email@example.com:your-password');
  console.log('');
  console.log('Waiting for connections...');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('[!] Port 6667 is already in use. Close other IRC servers first.');
  } else {
    console.error('[!] Server error:', err.message);
  }
  process.exit(1);
});
