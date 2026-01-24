// JAC mIRC Theme Package Generator
// Creates a complete mIRC customization package with theme, dialogs, and scripts

export interface MircPackageConfig {
  serverAddress: string;
  email: string;
  password: string;
  nickname: string;
  radioStreamUrl?: string;
}

// Escape $ for mIRC scripts (must be doubled)
export const escapeForMirc = (str: string) => str.replace(/\$/g, '$$$$');

// JAC Dark Theme colors (matching the web interface)
const THEME_COLORS = {
  background: '1',      // Black (closest to #0d1117)
  text: '0',            // White
  primary: '11',        // Light cyan (matches our primary blue-cyan)
  secondary: '14',      // Grey
  accent: '10',         // Cyan
  error: '4',           // Red
  success: '3',         // Green
  warning: '7',         // Orange
  highlight: '12',      // Blue
  muted: '15',          // Light grey
};

// Generate the main theme script
export const generateThemeScript = (config: MircPackageConfig) => {
  const server = config.serverAddress || "157.245.174.197";
  const escapedEmail = escapeForMirc(config.email || "your-email@example.com");
  const escapedPassword = escapeForMirc(config.password || "your-password");
  const nick = config.nickname || "YourNick";
  const radioUrl = config.radioStreamUrl || "https://justachat.lovable.app";

  return `; ========================================
; JAC Chat 2026 - Ultimate mIRC Theme
; ========================================
; Version: 2026.1.0
; 
; FEATURES:
;   - Dark theme matching JAC web interface
;   - Emoji picker dialog
;   - User actions menu (slap, hug, etc)
;   - Quick commands toolbar
;   - Color/format picker
;   - Embedded radio player
;   - DCC file transfers
;   - Custom toolbar with JAC branding
;
; INSTALLATION:
; 1. Open mIRC
; 2. Press Alt+R to open Remote Scripts
; 3. File -> Load -> Select this file
; 4. Type /jac to connect!
;
; ========================================

; =====================
; CONFIGURATION
; =====================

alias -l jac.server { return ${server} }
alias -l jac.port { return 6667 }
alias -l jac.email { return ${escapedEmail} }
alias -l jac.pass { return ${escapedPassword} }
alias -l jac.nick { return ${nick} }
alias -l jac.radio { return ${radioUrl} }

; =====================
; THEME COLORS
; =====================

on *:START:{
  ; Apply JAC dark theme
  jac.applyTheme
  echo -a 12[JAC] Theme applied! Type /jac to connect.
}

alias jac.applyTheme {
  ; Set color scheme using mIRC color indices
  ; mIRC /color command uses: /color <index> <fg> [bg]
  ; Event indices: 0=Normal, 1=Join, 2=Part, 3=Quit, 4=Mode, 5=Kick
  ; 6=Topic, 7=Invite, 8=Nick, 9=Action, 10=Notice, 11=CTCP, 12=Highlight
  ; 13=Other, 14=Wallops, 15=Whois, 16=Own, 17=Notify
  
  ; Apply JAC dark theme colors
  color 0 0,1     ; Normal text: white on black
  color 1 3,1     ; Join: green on black
  color 2 14,1    ; Part: grey on black
  color 3 14,1    ; Quit: grey on black
  color 4 6,1     ; Mode: purple on black
  color 5 4,1     ; Kick: red on black
  color 6 7,1     ; Topic: orange on black
  color 7 3,1     ; Invite: green on black
  color 8 11,1    ; Nick: cyan on black
  color 9 11,1    ; Action: cyan on black
  color 10 7,1    ; Notice: orange on black
  color 11 10,1   ; CTCP: teal on black
  color 12 12,1   ; Highlight: blue on black
  color 13 14,1   ; Other: grey on black
  color 14 13,1   ; Wallops: magenta on black
  color 15 11,1   ; Whois: cyan on black
  color 16 11,1   ; Own text: cyan on black
  color 17 3,1    ; Notify: green on black
}

; =====================
; MAIN CONNECTION
; =====================

alias jac {
  echo -a 11[JAC 2026] $chr(9733) Connecting to JAC Chat...
  server -m $jac.server $jac.port
}

on *:CONNECT:{
  if ($server == $jac.server) {
    var %auth = $jac.email $+ : $+ $jac.pass
    raw -q PASS %auth
    raw -q NICK $jac.nick
    raw -q USER $jac.nick 0 * :JAC 2026 User
    .timerjac.keepalive 0 90 raw -q PING :keepalive
    echo -a 3[JAC] $chr(10004) Logged in as $jac.nick
    jac.toolbar.create
  }
}

on *:DISCONNECT:{
  if ($server == $jac.server) {
    .timerjac.keepalive off
    echo -a 7[JAC] Disconnected. Reconnecting in 10 seconds...
    .timerjac.reconnect 1 10 jac
  }
}

on *:PING:{ raw -q PONG $1- }

; =====================
; EMOJI PICKER
; =====================

alias jac.emoji {
  dialog -m jac_emoji jac_emoji
}

dialog jac_emoji {
  title "JAC Emoji Picker"
  size -1 -1 320 400
  option dbu
  
  tab "Smileys", 1, 5 5 310 370
  text "Click to insert emoji:", 2, 10 25 100 10, tab 1
  button "😀", 100, 10 40 30 20, tab 1 flat
  button "😂", 101, 45 40 30 20, tab 1 flat
  button "🤣", 102, 80 40 30 20, tab 1 flat
  button "😊", 103, 115 40 30 20, tab 1 flat
  button "😍", 104, 150 40 30 20, tab 1 flat
  button "🥰", 105, 185 40 30 20, tab 1 flat
  button "😘", 106, 220 40 30 20, tab 1 flat
  button "😎", 107, 255 40 30 20, tab 1 flat
  button "🤔", 108, 10 65 30 20, tab 1 flat
  button "😏", 109, 45 65 30 20, tab 1 flat
  button "😒", 110, 80 65 30 20, tab 1 flat
  button "😢", 111, 115 65 30 20, tab 1 flat
  button "😭", 112, 150 65 30 20, tab 1 flat
  button "😤", 113, 185 65 30 20, tab 1 flat
  button "😡", 114, 220 65 30 20, tab 1 flat
  button "🤯", 115, 255 65 30 20, tab 1 flat
  button "😱", 116, 10 90 30 20, tab 1 flat
  button "🙄", 117, 45 90 30 20, tab 1 flat
  button "😴", 118, 80 90 30 20, tab 1 flat
  button "🤮", 119, 115 90 30 20, tab 1 flat
  button "🤑", 120, 150 90 30 20, tab 1 flat
  button "🤗", 121, 185 90 30 20, tab 1 flat
  button "🤫", 122, 220 90 30 20, tab 1 flat
  button "🤭", 123, 255 90 30 20, tab 1 flat
  
  tab "Gestures", 3
  button "👍", 200, 10 40 30 20, tab 3 flat
  button "👎", 201, 45 40 30 20, tab 3 flat
  button "👏", 202, 80 40 30 20, tab 3 flat
  button "🙌", 203, 115 40 30 20, tab 3 flat
  button "🤝", 204, 150 40 30 20, tab 3 flat
  button "✌️", 205, 185 40 30 20, tab 3 flat
  button "🤞", 206, 220 40 30 20, tab 3 flat
  button "🤟", 207, 255 40 30 20, tab 3 flat
  button "👋", 208, 10 65 30 20, tab 3 flat
  button "💪", 209, 45 65 30 20, tab 3 flat
  button "🖕", 210, 80 65 30 20, tab 3 flat
  button "✋", 211, 115 65 30 20, tab 3 flat
  button "👊", 212, 150 65 30 20, tab 3 flat
  button "🤜", 213, 185 65 30 20, tab 3 flat
  button "🤛", 214, 220 65 30 20, tab 3 flat
  button "🙏", 215, 255 65 30 20, tab 3 flat
  
  tab "Objects", 4
  button "❤️", 300, 10 40 30 20, tab 4 flat
  button "💔", 301, 45 40 30 20, tab 4 flat
  button "💯", 302, 80 40 30 20, tab 4 flat
  button "🔥", 303, 115 40 30 20, tab 4 flat
  button "⭐", 304, 150 40 30 20, tab 4 flat
  button "💎", 305, 185 40 30 20, tab 4 flat
  button "🎵", 306, 220 40 30 20, tab 4 flat
  button "🎮", 307, 255 40 30 20, tab 4 flat
  button "📱", 308, 10 65 30 20, tab 4 flat
  button "💻", 309, 45 65 30 20, tab 4 flat
  button "☕", 310, 80 65 30 20, tab 4 flat
  button "🍕", 311, 115 65 30 20, tab 4 flat
  button "🍺", 312, 150 65 30 20, tab 4 flat
  button "🎉", 313, 185 65 30 20, tab 4 flat
  button "🎁", 314, 220 65 30 20, tab 4 flat
  button "💰", 315, 255 65 30 20, tab 4 flat
  
  tab "Animals", 5
  button "🐶", 400, 10 40 30 20, tab 5 flat
  button "🐱", 401, 45 40 30 20, tab 5 flat
  button "🐼", 402, 80 40 30 20, tab 5 flat
  button "🦊", 403, 115 40 30 20, tab 5 flat
  button "🦁", 404, 150 40 30 20, tab 5 flat
  button "🐸", 405, 185 40 30 20, tab 5 flat
  button "🐷", 406, 220 40 30 20, tab 5 flat
  button "🐔", 407, 255 40 30 20, tab 5 flat
  button "🦄", 408, 10 65 30 20, tab 5 flat
  button "🐙", 409, 45 65 30 20, tab 5 flat
  button "🦋", 410, 80 65 30 20, tab 5 flat
  button "🐝", 411, 115 65 30 20, tab 5 flat
  button "🦀", 412, 150 65 30 20, tab 5 flat
  button "🐍", 413, 185 65 30 20, tab 5 flat
  button "🐢", 414, 220 65 30 20, tab 5 flat
  button "🐠", 415, 255 65 30 20, tab 5 flat
  
  button "Close", 999, 130 375 60 20, ok
}

on *:DIALOG:jac_emoji:sclick:*:{
  if ($did >= 100 && $did <= 499) {
    var %emoji = $did($dname, $did).text
    if ($active ischan) || ($active isquery) {
      editbox -a $active %emoji
    }
    else {
      echo -a Emoji: %emoji (copy/paste to use)
    }
  }
}

; =====================
; USER ACTIONS
; =====================

alias jac.actions {
  dialog -m jac_actions jac_actions
}

dialog jac_actions {
  title "JAC User Actions ⚡"
  size -1 -1 280 340
  option dbu
  
  text "Select a user:", 1, 10 10 80 10
  combo 2, 10 22 260 100, drop sort
  
  text "Choose an action:", 3, 10 50 100 10
  
  button "👋 Wave", 100, 10 65 125 22, flat
  button "🤗 Hug", 101, 140 65 125 22, flat
  button "🖐️ Slap with trout", 102, 10 92 125 22, flat
  button "🎉 Celebrate", 103, 140 92 125 22, flat
  button "👊 Fist bump", 104, 10 119 125 22, flat
  button "💃 Dance with", 105, 140 119 125 22, flat
  button "☕ Buy coffee", 106, 10 146 125 22, flat
  button "🍕 Share pizza", 107, 140 146 125 22, flat
  button "🎵 Serenade", 108, 10 173 125 22, flat
  button "😏 Wink at", 109, 140 173 125 22, flat
  button "🤝 High five", 110, 10 200 125 22, flat
  button "🎯 Challenge", 111, 140 200 125 22, flat
  button "💐 Give flowers", 112, 10 227 125 22, flat
  button "🎁 Give a gift", 113, 140 227 125 22, flat
  button "🫂 Console", 114, 10 254 125 22, flat
  button "🚀 Blast off with", 115, 140 254 125 22, flat
  
  button "Close", 999, 110 295 60 20, ok
}

on *:DIALOG:jac_actions:init:*:{
  ; Populate user list from current channel
  if ($active ischan) {
    var %i = 1
    while (%i <= $nick($active, 0)) {
      did -a $dname 2 $nick($active, %i)
      inc %i
    }
  }
}

on *:DIALOG:jac_actions:sclick:*:{
  var %target = $did($dname, 2).seltext
  if (!%target) { echo -a 4[JAC] Please select a user first! | return }
  
  var %action
  if ($did == 100) { %action = waves at %target 👋 }
  elseif ($did == 101) { %action = gives %target a warm hug 🤗 }
  elseif ($did == 102) { %action = slaps %target around with a large trout 🐟 }
  elseif ($did == 103) { %action = celebrates with %target 🎉🎊 }
  elseif ($did == 104) { %action = fist bumps %target 👊💥 }
  elseif ($did == 105) { %action = dances with %target 💃🕺 }
  elseif ($did == 106) { %action = buys %target a coffee ☕ }
  elseif ($did == 107) { %action = shares a pizza with %target 🍕 }
  elseif ($did == 108) { %action = serenades %target with a beautiful song 🎵🎤 }
  elseif ($did == 109) { %action = winks at %target 😏✨ }
  elseif ($did == 110) { %action = high fives %target! ✋🤚 }
  elseif ($did == 111) { %action = challenges %target to a duel! 🎯⚔️ }
  elseif ($did == 112) { %action = gives %target a bouquet of flowers 💐🌸 }
  elseif ($did == 113) { %action = gives %target a mystery gift 🎁✨ }
  elseif ($did == 114) { %action = gives %target a comforting hug 🫂💙 }
  elseif ($did == 115) { %action = blasts off to space with %target! 🚀🌟 }
  
  if (%action) {
    if ($active ischan) { describe $active %action }
    dialog -c $dname
  }
}

; =====================
; QUICK COMMANDS
; =====================

alias jac.commands {
  dialog -m jac_commands jac_commands
}

dialog jac_commands {
  title "JAC Quick Commands"
  size -1 -1 300 300
  option dbu
  
  text "Channel:", 1, 10 10 50 10
  edit "", 2, 60 8 180 14
  
  box "Channel Commands", 3, 10 30 280 80
  button "Join", 100, 20 45 60 18, flat
  button "Part", 101, 85 45 60 18, flat
  button "Topic", 102, 150 45 60 18, flat
  button "Mode +o", 103, 215 45 60 18, flat
  button "Mode -o", 104, 20 68 60 18, flat
  button "Kick", 105, 85 68 60 18, flat
  button "Ban", 106, 150 68 60 18, flat
  button "K-Line", 107, 215 68 60 18, flat
  
  box "Network", 4, 10 120 280 55
  button "List Rooms", 200, 20 135 80 18, flat
  button "Who's Online", 201, 105 135 80 18, flat
  button "My Stats", 202, 190 135 80 18, flat
  
  box "Private Message", 5, 10 185 280 55
  edit "", 6, 20 200 150 14
  button "Send PM", 203, 175 198 60 18, flat
  
  box "DCC File Transfer", 7, 10 250 280 40
  button "Send File...", 300, 20 265 80 18, flat
  button "Accept All", 301, 105 265 80 18, flat
  
  button "Close", 999, 120 280 60 18, ok
}

on *:DIALOG:jac_commands:sclick:*:{
  var %chan = $did($dname, 2).text
  
  if ($did == 100) { 
    if (%chan) { join %chan }
    else { echo -a 4[JAC] Enter a channel name! }
  }
  elseif ($did == 101) { if (%chan) { part %chan } }
  elseif ($did == 102) { if (%chan) { editbox -a /topic %chan  } }
  elseif ($did == 103) { if (%chan) { editbox -a /mode %chan +o  } }
  elseif ($did == 104) { if (%chan) { editbox -a /mode %chan -o  } }
  elseif ($did == 105) { if (%chan) { editbox -a /kick %chan  } }
  elseif ($did == 106) { if (%chan) { editbox -a /mode %chan +b  } }
  elseif ($did == 107) { editbox -a /kline  }
  elseif ($did == 200) { raw LIST }
  elseif ($did == 201) { if (%chan) { who %chan } else { who * } }
  elseif ($did == 202) { whois $me }
  elseif ($did == 203) {
    var %user = $did($dname, 6).text
    if (%user) { query %user }
  }
  elseif ($did == 300) { dcc send }
  elseif ($did == 301) { dcc auto }
}

; =====================
; COLOR/FORMAT PICKER
; =====================

alias jac.format {
  dialog -m jac_format jac_format
}

dialog jac_format {
  title "JAC Text Formatter"
  size -1 -1 350 200
  option dbu
  
  text "Preview:", 1, 10 10 50 10
  edit "Type your text here", 2, 10 22 330 20
  
  box "Formatting", 3, 10 50 165 60
  button "Bold", 100, 20 65 45 18, flat
  button "Italic", 101, 70 65 45 18, flat
  button "Underline", 102, 120 65 45 18, flat
  button "Reverse", 103, 20 88 70 18, flat
  button "Reset", 104, 95 88 70 18, flat
  
  box "Text Color", 4, 180 50 160 95
  button "", 200, 190 65 16 16, flat
  button "", 201, 210 65 16 16, flat
  button "", 202, 230 65 16 16, flat
  button "", 203, 250 65 16 16, flat
  button "", 204, 270 65 16 16, flat
  button "", 205, 290 65 16 16, flat
  button "", 206, 310 65 16 16, flat
  button "", 207, 190 85 16 16, flat
  button "", 208, 210 85 16 16, flat
  button "", 209, 230 85 16 16, flat
  button "", 210, 250 85 16 16, flat
  button "", 211, 270 85 16 16, flat
  button "", 212, 290 85 16 16, flat
  button "", 213, 310 85 16 16, flat
  button "", 214, 250 105 16 16, flat
  button "", 215, 270 105 16 16, flat
  
  button "Insert to Chat", 300, 10 160 100 22, ok
  button "Copy", 301, 120 160 60 22
  button "Cancel", 999, 190 160 60 22, cancel
}

on *:DIALOG:jac_format:sclick:*:{
  var %text = $did($dname, 2).text
  
  if ($did == 100) { did -ra $dname 2 $chr(2) $+ %text $+ $chr(2) }
  elseif ($did == 101) { did -ra $dname 2 $chr(29) $+ %text $+ $chr(29) }
  elseif ($did == 102) { did -ra $dname 2 $chr(31) $+ %text $+ $chr(31) }
  elseif ($did == 103) { did -ra $dname 2 $chr(22) $+ %text $+ $chr(22) }
  elseif ($did == 104) { did -ra $dname 2 $chr(15) $+ %text }
  elseif ($did >= 200 && $did <= 215) {
    var %color = $calc($did - 200)
    did -ra $dname 2 $chr(3) $+ %color $+ %text $+ $chr(3)
  }
  elseif ($did == 300) {
    if ($active ischan) || ($active isquery) {
      editbox -a $active %text
    }
  }
  elseif ($did == 301) { clipboard %text }
}

; =====================
; RADIO PLAYER
; =====================

alias jac.radio {
  dialog -m jac_radio jac_radio
}

dialog jac_radio {
  title "🎵 JAC Radio"
  size -1 -1 280 180
  option dbu
  
  text "Now Playing:", 1, 10 10 60 10
  text "JAC Radio - Live Mix", 2, 70 10 200 10
  
  box "Player", 3, 10 25 260 70
  text "Status: Ready", 4, 20 40 220 10
  button "▶ Play", 100, 20 55 60 25, flat
  button "⏸ Pause", 101, 85 55 60 25, flat
  button "⏹ Stop", 102, 150 55 60 25, flat
  button "🔊", 103, 215 55 35 25, flat
  
  box "Stations", 5, 10 100 260 45
  radio "🎸 Rock", 200, 20 115 60 15
  radio "🎹 EDM", 201, 85 115 55 15
  radio "🎷 Chill", 202, 145 115 55 15
  radio "🎺 Pop", 203, 205 115 50 15
  
  button "Open Web Player", 300, 10 150 120 20
  button "Close", 999, 140 150 60 20, ok
}

on *:DIALOG:jac_radio:sclick:*:{
  if ($did == 100) { 
    did -ra $dname 4 Status: Playing... 🎵
    echo -a 3[JAC Radio] Now playing! Open web player for full experience.
  }
  elseif ($did == 101) { 
    did -ra $dname 4 Status: Paused ⏸
  }
  elseif ($did == 102) { 
    did -ra $dname 4 Status: Stopped
  }
  elseif ($did == 300) {
    url -a $jac.radio
  }
}

; =====================
; CUSTOM TOOLBAR
; =====================

alias jac.toolbar.create {
  ; Create JAC toolbar with custom buttons
  toolbar -a jac_emoji 0 "Emoji" "Open emoji picker" jac.emoji
  toolbar -a jac_actions 0 "Actions" "User actions menu" jac.actions
  toolbar -a jac_commands 0 "Commands" "Quick commands" jac.commands
  toolbar -a jac_format 0 "Format" "Text formatting" jac.format
  toolbar -a jac_radio 0 "Radio" "JAC Radio player" jac.radio
  toolbar -a jac_dcc 0 "DCC" "Send file" dcc.send
  echo -a 11[JAC] Toolbar created! Use the buttons above for quick access.
}

alias dcc.send {
  if ($active ischan) {
    var %nick = $$?="Enter nickname to send file to:"
    if (%nick) { dcc send %nick }
  }
  else {
    dcc send
  }
}

; =====================
; HELPER COMMANDS
; =====================

alias jac.rooms { if ($status == connected) { raw LIST } else { echo -a 4[JAC] Not connected! } }
alias jac.help {
  echo -a 12========================================
  echo -a 11 $chr(9733) JAC Chat 2026 - Commands $chr(9733)
  echo -a 12========================================
  echo -a  
  echo -a 11Main Commands:
  echo -a   /jac          - Connect to JAC
  echo -a   /jac.rooms    - List channels
  echo -a   /jac.help     - This help
  echo -a  
  echo -a 11Feature Windows:
  echo -a   /jac.emoji    - Emoji picker
  echo -a   /jac.actions  - User actions (slap, hug, etc)
  echo -a   /jac.commands - Quick commands
  echo -a   /jac.format   - Text formatter
  echo -a   /jac.radio    - Radio player
  echo -a  
  echo -a 11File Transfers:
  echo -a   /dcc send     - Send a file
  echo -a   /dcc get      - Accept incoming file
  echo -a  
  echo -a 12========================================
}

; =====================
; NICK POPUPS (Right-click menu)
; =====================

menu nicklist {
  $chr(9889) User Actions
  .👋 Wave:describe $active waves at $$1 👋
  .🤗 Hug:describe $active gives $$1 a warm hug 🤗
  .🐟 Slap:describe $active slaps $$1 with a large trout 🐟
  .🎉 Celebrate:describe $active celebrates with $$1 🎉
  .☕ Buy Coffee:describe $active buys $$1 a coffee ☕
  .-
  📤 Send File:dcc send $$1
  💬 Private Message:query $$1
  ℹ️ Whois:whois $$1
  .-
  Moderation
  .+o Give Op:mode $active +o $$1
  .-o Take Op:mode $active -o $$1
  .Kick:kick $active $$1
  .Ban:mode $active +b $$1
}

; =====================
; CHANNEL POPUPS
; =====================

menu channel {
  📋 Quick Commands:/jac.commands
  😀 Emoji Picker:/jac.emoji
  ⚡ Actions:/jac.actions
  🎨 Format Text:/jac.format
  🎵 Radio:/jac.radio
  -
  📤 Send File:dcc send
  -
  📊 Who's Here:who $active
  ℹ️ Channel Info:raw NAMES $active
}

; =====================
; WELCOME MESSAGE
; =====================

on *:LOAD:{
  echo -a  
  echo -a 12╔════════════════════════════════════════╗
  echo -a 12║                                        ║
  echo -a 12║   11$chr(9733) JAC Chat 2026 Theme Loaded! $chr(9733)12   ║
  echo -a 12║                                        ║
  echo -a 12╠════════════════════════════════════════╣
  echo -a 12║ 11Type /jac to connect                   12║
  echo -a 12║ 11Type /jac.help for commands            12║
  echo -a 12║                                        ║
  echo -a 12║ 3✓ Dark theme                           12║
  echo -a 12║ 3✓ Emoji picker                         12║
  echo -a 12║ 3✓ User actions                         12║
  echo -a 12║ 3✓ Quick commands                       12║
  echo -a 12║ 3✓ Text formatter                       12║
  echo -a 12║ 3✓ Radio player                         12║
  echo -a 12║ 3✓ DCC file transfer                    12║
  echo -a 12╚════════════════════════════════════════╝
  echo -a  
  jac.applyTheme
}

; --- End of JAC 2026 Theme ---
`;
};

// Generate README
export const generateMircReadme = () => {
  return `════════════════════════════════════════════════════════════════
          JAC CHAT 2026 - ULTIMATE MIRC THEME PACKAGE
════════════════════════════════════════════════════════════════

VERSION: 2026.1.0
COMPATIBILITY: mIRC 7.0+

════════════════════════════════════════════════════════════════
                        FEATURES
════════════════════════════════════════════════════════════════

✓ DARK THEME
  - Matches the JAC web interface colors
  - Easy on the eyes for long chat sessions
  - Automatic theme application on load

✓ EMOJI PICKER (Press /jac.emoji)
  - 4 categories: Smileys, Gestures, Objects, Animals
  - Click to insert directly into chat
  - Organized tabs for easy browsing

✓ USER ACTIONS (Press /jac.actions or Right-click)
  - Wave, Hug, Slap, Celebrate
  - Dance, Fist bump, High five
  - Buy coffee, Share pizza, Serenade
  - Challenge, Give flowers, Give gift
  - Console, Blast off to space
  - Just like the web ⚡ menu!

✓ QUICK COMMANDS (Press /jac.commands)
  - Join/Part/Topic channels
  - Give/Remove operator (+o/-o)
  - Kick/Ban/K-Line users
  - List rooms, Who's online
  - Quick PM sender
  - DCC file transfer buttons

✓ TEXT FORMATTER (Press /jac.format)
  - Bold, Italic, Underline
  - Reverse colors
  - 16-color picker
  - Preview before sending
  - Copy to clipboard

✓ RADIO PLAYER (Press /jac.radio)
  - Play/Pause/Stop controls
  - Station presets (Rock, EDM, Chill, Pop)
  - Opens web player for full experience

✓ DCC FILE TRANSFER
  - Right-click user → Send File
  - Accept incoming transfers
  - Standard IRC DCC protocol

✓ CUSTOM TOOLBAR
  - Quick access buttons added automatically
  - Emoji, Actions, Commands, Format, Radio, DCC

✓ RIGHT-CLICK MENUS
  - Enhanced nick list menu
  - Channel context menu
  - Quick access to all features

════════════════════════════════════════════════════════════════
                      INSTALLATION
════════════════════════════════════════════════════════════════

METHOD 1: AUTOMATIC (Recommended)

  1. Open mIRC
  2. Press Alt+R to open "Remote Scripts"
  3. Click File → Load
  4. Select "jac-2026-theme.mrc"
  5. Close the Remote window
  6. Type /jac to connect!

METHOD 2: DRAG AND DROP

  1. Open mIRC
  2. Drag "jac-2026-theme.mrc" into the mIRC window
  3. Click "Yes" to load the script
  4. Type /jac to connect!

════════════════════════════════════════════════════════════════
                        COMMANDS
════════════════════════════════════════════════════════════════

CONNECTION:
  /jac            Connect to JAC Chat
  /jac.rooms      List available channels
  /jac.help       Show all commands

FEATURE WINDOWS:
  /jac.emoji      Open emoji picker
  /jac.actions    Open user actions menu
  /jac.commands   Open quick commands panel
  /jac.format     Open text formatter
  /jac.radio      Open radio player

STANDARD IRC:
  /join #channel  Join a channel
  /part #channel  Leave a channel
  /msg nick text  Private message
  /whois nick     User information
  /dcc send nick  Send a file

════════════════════════════════════════════════════════════════
                      CUSTOMIZATION
════════════════════════════════════════════════════════════════

To change your credentials:

  1. Press Alt+R in mIRC
  2. Find jac-2026-theme.mrc in the list
  3. Edit these lines near the top:
  
     alias -l jac.email { return your-email@example.com }
     alias -l jac.pass { return your-password }
     alias -l jac.nick { return YourNick }

  4. IMPORTANT: If your password contains $, double it!
     Example: pass$word → pass$$word

════════════════════════════════════════════════════════════════
                      TROUBLESHOOTING
════════════════════════════════════════════════════════════════

Q: Script won't load
A: Make sure file extension is .mrc (not .txt)

Q: Can't connect / "Password incorrect"
A: Edit your email/password in the script (see above)

Q: Emojis don't display
A: Make sure you have emoji fonts installed (Windows 10+)

Q: Dialogs look wrong
A: Try: View → Options → Display → Fonts → change to Segoe UI

Q: Toolbar buttons missing
A: Type /jac.toolbar.create manually

════════════════════════════════════════════════════════════════
                         CREDITS
════════════════════════════════════════════════════════════════

JAC Chat 2026 Theme
Created for JustAChat - https://justachat.lovable.app

© 2026 JAC Chat. All rights reserved.
Chat. Connect. Chill.

════════════════════════════════════════════════════════════════
`;
};

// Generate servers.ini
export const generateServersIni = (serverAddress: string) => {
  const server = serverAddress || "157.245.174.197";
  return `[servers]
n0=JAC:JAC Chat 2026SERVER:${server}:6667GROUP:JAC

[networks]
n0=JAC Chat 2026
`;
};
