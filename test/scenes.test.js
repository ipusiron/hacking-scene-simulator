const test = require('node:test');
const assert = require('node:assert/strict');
const {
    SCENES, SCENE_LINES, METASPLOIT_ARTS, METASPLOIT_TAIL,
    metasploitLines, classifyLine, formatTimer, nextDelay
} = require('../scenes.js');

const classificationCases = [
    ['linux', 'root@hackbox:~# nmap -sS -A 192.168.1.0/24', 'command-prompt'],
    ['linux', 'admin@target:~$ whoami', 'command-prompt'],
    ['linux', "admin@target:~$ sudo vim -c '!sh' /dev/null", 'command-prompt'],
    ['linux', 'root:$6$xyz123$abc...def:19000:0:99999:7:::', ''],
    ['linux', 'uid=0(root) gid=0(root) groups=0(root)', ''],
    ['linux', 'CTF{R00t_4cc355_4ch13v3d_v14_5ud0_v1m}', ''],
    ['wireshark', 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)', 'command-prompt'],
    ['wireshark', '    Frame Number: 1', ''],
    ['wireshark', '    Type: IPv4 (0x0800)', ''],
    ['wireshark', '    Protocol: TCP (6)', ''],
    ['wireshark', 'Internet Protocol Version 4, Src: 192.168.1.100, Dst: 192.168.1.50', 'info-text'],
    ['wireshark', '[HTTP] Authorization: Basic YWRtaW46cGFzc3dvcmQ=', 'error-text'],
    ['metasploit', '[*] No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp', 'info-text'],
    ['metasploit', 'meterpreter > sysinfo', 'command-prompt'],
    ['metasploit', 'root@server:/var/www/html# id', 'error-text'],
    ['metasploit', 'CTF{M3t45pl01t_Pwn4g3_C0mpl3t3d!}', 'success-text'],
    ['nmap', 'Discovered open port 22/tcp on 192.168.1.1', 'success-text'],
    ['nmap', 'Completed NSE at 14:35, 2.34s elapsed', 'warning-text'],
    ['retro', '[SUCCESS] Root Access Achieved', 'success-text'],
    ['unknown', 'anything', ''],
    ['linux', 'user1@host:/tmp$ ls', 'command-prompt'],
    ['linux', 'root@host:~#', ''],
    ['retro', '[EXPLOITING] Buffer Overflow', 'warning-text'],
    ['retro', '>>> LOADING', 'info-text'],
    ['retro', 'prefix >>> LOADING', ''],
    ['nmap', 'Starting Nmap', 'info-text'],
    ['nmap', 'Initiating SYN scan', 'info-text'],
    ['nmap', 'prefix Completed NSE', ''],
    ['wireshark', '    Frame Length: 74 bytes (592 bits)', ''],
    ['wireshark', '    [Expert Info (Warning)]', 'warning-text'],
    ['wireshark', 'Transmission Control Protocol, Src Port: 443', 'info-text'],
    ['wireshark', 'Ethernet II, Src: test', 'info-text'],
    ['metasploit', 'msf6 > help', 'command-prompt'],
    ['metasploit', '    msf6 is a tool', ''],
    ['toString', 'anything', '']
];

for (const [scene, text, expected] of classificationCases) {
    test('classifyLine ' + scene + ': ' + text, () => {
        assert.equal(classifyLine(scene, text), expected);
    });
}

test('non-string text never acquires a CSS class', () => {
    for (const value of [null, undefined, 0, {}, [], true]) {
        for (const scene of SCENES) assert.equal(classifyLine(scene.id, value), '');
    }
});

for (const [seconds, expected] of [
    [60, '残り時間: 1:00'], [5, '残り時間: 0:05'], [600, '残り時間: 10:00'],
    [0, '残り時間: 0:00'], [-3, '残り時間: 0:00'], [125, '残り時間: 2:05']
]) {
    test('formatTimer(' + seconds + ') = ' + expected, () => {
        assert.equal(formatTimer(seconds), expected);
    });
}

test('six scene identifiers and CSS classes remain stable', () => {
    assert.deepEqual(SCENES.map(scene => scene.id), ['linux', 'matrix', 'retro', 'nmap', 'wireshark', 'metasploit']);
    assert.deepEqual(SCENES.map(scene => scene.className), ['terminal', 'matrix', 'retro', 'nmap', 'wireshark', 'metasploit']);
    for (const scene of SCENES) {
        assert.deepEqual(Object.keys(scene), ['id', 'title', 'description', 'className']);
        assert.ok(scene.title && scene.description);
    }
});

for (const [scene, count] of Object.entries({ linux: 44, retro: 39, nmap: 69, wireshark: 62 })) {
    test(scene + ' has exactly ' + count + ' lines', () => {
        assert.equal(SCENE_LINES[scene].length, count);
    });
}

test('all five Metasploit arts concatenate without mutating the source', () => {
    assert.equal(METASPLOIT_ARTS.length, 5);
    for (let i = 0; i < 5; i++) {
        const result = metasploitLines(i);
        assert.equal(result.length, METASPLOIT_ARTS[i].length + METASPLOIT_TAIL.length);
        assert.deepEqual(result, [...METASPLOIT_ARTS[i], ...METASPLOIT_TAIL]);
        result.pop();
        assert.equal(metasploitLines(i).length, METASPLOIT_ARTS[i].length + METASPLOIT_TAIL.length);
    }
});

for (const invalid of [99, -1, 'x', '1', 0.5, NaN, Infinity, null, undefined]) {
    test('metasploitLines invalid index ' + String(invalid) + ' uses art zero', () => {
        assert.deepEqual(metasploitLines(invalid), metasploitLines(0));
    });
}

for (const [scene, scale, base] of [
    ['linux', 1000, 500], ['retro', 1500, 800], ['nmap', 800, 400],
    ['wireshark', 600, 300], ['metasploit', 1200, 600], ['unknown', 0, 800]
]) {
    test('nextDelay ' + scene + ' evaluates supplied randomness', () => {
        for (const rand of [0, 0.25, 0.5, 0.999]) {
            assert.equal(nextDelay(scene, rand), rand * scale + base);
        }
    });
}

const allScenes = Object.entries(SCENE_LINES).concat(
    METASPLOIT_ARTS.map((_, index) => ['metasploit', metasploitLines(index)])
);
const knownClasses = new Set(['', 'command-prompt', 'error-text', 'success-text', 'info-text', 'warning-text']);
for (const [index, [scene, lines]] of allScenes.entries()) {
    test(scene + ' dataset ' + index + ': every line is single-line, half-width text and classifiable', () => {
        assert.ok(lines.length > 0);
        for (const [lineIndex, line] of lines.entries()) {
            const message = scene + ':' + lineIndex + ': ' + JSON.stringify(line);
            assert.equal(typeof line, 'string', message);
            assert.doesNotMatch(line, /[\r\n\t\u3000\uff01-\uff60]/u, message);
            for (const char of line) {
                const point = char.codePointAt(0);
                assert.ok(
                    (point >= 0x20 && point <= 0x7e) || (point >= 0x2500 && point <= 0x257f) || point === 0x2588,
                    message + ': unexpected U+' + point.toString(16)
                );
            }
            assert.ok(knownClasses.has(classifyLine(scene, line)), message);
        }
    });
}
