const test = require('node:test');
const assert = require('node:assert/strict');
const { SCENE_LINES, METASPLOIT_ARTS, metasploitLines } = require('../scenes.js');

const nmap = SCENE_LINES.nmap.join('\n');
const wire = SCENE_LINES.wireshark.join('\n');
const linux = SCENE_LINES.linux.join('\n');
const msf = metasploitLines(0).join('\n');

function match(text, pattern) {
    const result = text.match(pattern);
    assert.ok(result, 'required data not found: ' + pattern);
    return result;
}

function matches(text, pattern) {
    const result = [...text.matchAll(pattern)];
    assert.ok(result.length > 0, 'required data not found: ' + pattern);
    return result;
}

function reportData() {
    const starts = matches(nmap, /^Nmap scan report for [^\n]+ \(([\d.]+)\)$/gm);
    return starts.map((entry, index) => {
        const body = nmap.slice(entry.index, starts[index + 1]?.index ?? nmap.length);
        return {
            host: entry[1],
            ports: matches(body, /^(\d+)\/tcp\s+open\b/gm).map(item => Number(item[1])).sort((a, b) => a - b),
            closed: Number(match(body, /Not shown: (\d+) closed ports/)[1])
        };
    });
}

test('Nmap: all ten discoveries exactly equal the three report port sets', () => {
    const discovered = matches(nmap, /^Discovered open port (\d+)\/tcp on ([\d.]+)$/gm);
    assert.equal(discovered.length, 10);
    const grouped = {};
    for (const [, port, host] of discovered) (grouped[host] ??= []).push(Number(port));
    const report = reportData();
    assert.equal(report.length, 3);
    const expected = Object.fromEntries(report.map(item => [item.host, item.ports]));
    for (const values of Object.values(grouped)) values.sort((a, b) => a - b);
    assert.deepEqual(grouped, expected);
});

test('Nmap: each host accounts for all 1000 ports', () => {
    for (const report of reportData()) assert.equal(report.closed + report.ports.length, 1000, report.host);
});

test('Nmap: hosts, DNS, service counts and total scanned ports agree', () => {
    const report = reportData();
    const hosts = Number(match(nmap, /Scanning (\d+) hosts \[1000 ports\/host\]/)[1]);
    assert.equal(hosts, report.length);
    assert.equal(Number(match(nmap, /\((\d+) total ports\)/)[1]), hosts * 1000);
    const open = report.reduce((sum, item) => sum + item.ports.length, 0);
    assert.equal(open, 10);
    for (const pattern of [/Scanning (\d+) services on (\d+) hosts/, /\((\d+) services on (\d+) hosts\)/]) {
        const [, services, count] = match(nmap, pattern);
        assert.equal(Number(services), open);
        assert.equal(Number(count), hosts);
    }
    for (const pattern of [
        /Nmap done: \d+ IP addresses \((\d+) hosts up\)/,
        /Initiating Parallel DNS resolution of (\d+) hosts/,
        /Completed Parallel DNS resolution of (\d+) hosts/
    ]) assert.equal(Number(match(nmap, pattern)[1]), hosts);
});

test('Nmap: completed phases fit within the total duration', () => {
    const phases = matches(nmap, /([\d.]+)s elapsed/g);
    assert.equal(phases.length, 5);
    const sum = phases.reduce((total, item) => total + Number(item[1]), 0);
    assert.ok(Math.abs(sum - 19.08) < 0.0001);
    const total = Number(match(nmap, /scanned in ([\d.]+) seconds/)[1]);
    assert.equal(total, 19.42);
    assert.ok(sum <= total);
});

test('Wireshark: frame bytes, bits, captured bytes and displayed lengths agree', () => {
    const [, bytes, bits, captured, capturedBits] = match(
        wire, /^Frame 1: (\d+) bytes on wire \((\d+) bits\), (\d+) bytes captured \((\d+) bits\)/m
    ).map((value, index) => index ? Number(value) : value);
    assert.equal(bytes * 8, bits);
    assert.equal(captured * 8, capturedBits);
    assert.equal(Number(match(wire, /Frame Length: (\d+) bytes/)[1]), bytes);
    assert.equal(Number(match(wire, /Capture Length: (\d+) bytes/)[1]), captured);
    assert.equal(bytes - 14, Number(match(wire, /Total Length: (\d+)/)[1]));
});

function headerLengths() {
    const ip = match(wire, /\.\.\.\. (\d{4}) = Header Length: (\d+) bytes \((\d+)\)/);
    const tcp = match(wire, /(\d{4}) \.\.\.\. = Header Length: (\d+) bytes \((\d+)\)/);
    for (const header of [ip, tcp]) {
        assert.equal(parseInt(header[1], 2), Number(header[3]));
        assert.equal(Number(header[2]), Number(header[3]) * 4);
    }
    return [Number(ip[2]), Number(tcp[2])];
}

test('Wireshark: binary header lengths, IP version and segment total agree', () => {
    const [ip, tcp] = headerLengths();
    assert.equal(ip, 20);
    assert.equal(tcp, 40);
    const segment = Number(match(wire, /\[TCP Segment Len: (\d+)\]/)[1]);
    assert.equal(ip + tcp + segment, Number(match(wire, /Total Length: (\d+)/)[1]));
    const version = match(wire, /(\d{4}) \.\.\.\. = Version: (\d+)/);
    assert.equal(parseInt(version[1], 2), Number(version[2]));
});

test('Wireshark: epoch seconds and nanoseconds match the JST arrival time', () => {
    const [, seconds, fraction] = match(wire, /Epoch Time: (\d+)\.(\d+) seconds/);
    const [, month, day, year, hour, minute, second, arrivalFraction] = match(
        wire, /Arrival Time: (\w+) (\d+), (\d+) (\d+):(\d+):(\d+)\.(\d+) JST/
    );
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    assert.ok(months.includes(month));
    const date = new Date(Number(seconds) * 1000 + 9 * 60 * 60 * 1000);
    assert.deepEqual(
        [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()],
        [Number(year), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second)]
    );
    assert.equal(fraction, arrivalFraction);
});

test('Wireshark: SYN-ACK bits, labels and consumed sequence number agree', () => {
    const [, hex, labels] = match(wire, /Flags: (0x[0-9a-f]+) \((.+)\)/);
    const flags = parseInt(hex, 16);
    assert.equal(Boolean(flags & 0x002), labels.split(', ').includes('SYN'));
    assert.equal(Boolean(flags & 0x010), labels.split(', ').includes('ACK'));
    assert.equal(flags, 0x012);
    assert.match(wire, /\[Next sequence number: 1\s+\(relative sequence number\)\]/);
});

test('Wireshark: the five options occupy exactly the extra 20 TCP header bytes', () => {
    const [, tcp] = headerLengths();
    const [, count, names] = match(wire, /Options: \((\d+) bytes\), (.+)/);
    const sizes = {
        'Maximum segment size': 4, 'SACK permitted': 2, Timestamps: 10,
        'No-Operation (NOP)': 1, 'Window scale': 3
    };
    assert.deepEqual(names.split(', '), Object.keys(sizes));
    assert.equal(Number(count), Object.values(sizes).reduce((sum, size) => sum + size, 0));
    assert.equal(Number(count), tcp - 20);
});

test('Wireshark: the deliberately fictional Basic-auth teaching example stays unchanged', () => {
    const encoded = match(wire, /Authorization: Basic ([A-Za-z0-9+/=]+)/)[1];
    assert.equal(Buffer.from(encoded, 'base64').toString('utf8'), 'admin:password');
});

test('Linux: last-login weekday is computed from its date and precedes the scan', () => {
    const [, weekday, month, day, time, year] = match(linux, /Last login: (\w{3}) (\w{3}) (\d+) ([\d:]+) (\d{4})/);
    const lastLogin = new Date(month + ' ' + day + ', ' + year + ' ' + time + ' GMT+0900');
    assert.ok(Number.isFinite(lastLogin.getTime()));
    const jstDate = new Date(lastLogin.getTime() + 9 * 60 * 60 * 1000);
    assert.equal(weekday, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][jstDate.getUTCDay()]);
    const [, y, m, d, h, min] = match(linux, /Starting Nmap [\d.]+ .* at (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) JST/);
    assert.ok(new Date(y + '-' + m + '-' + d + 'T' + h + ':' + min + ':00+09:00') >= lastLogin);
});

test('Metasploit: payload and Meterpreter architecture match, without changing the x64 host', () => {
    const architecture = match(msf, /defaulting to linux\/(x86|x64)\/meterpreter/)[1];
    assert.equal(match(msf, /Meterpreter  : (x86|x64)\/linux/)[1], architecture);
    const tuple = match(msf, /BuildTuple   : (\S+)/)[1];
    assert.ok(tuple.startsWith(architecture === 'x86' ? 'i486-' : 'x86_64-'));
    assert.match(msf, /Architecture : x64/);
});

const allLines = [
    ...Object.values(SCENE_LINES).flat(),
    ...METASPLOIT_ARTS.flatMap((_, index) => metasploitLines(index))
];

test('all actual IPv4 addresses are RFC1918 private addresses', () => {
    // Token boundaries exclude software version suffixes such as 8.0.27-0ubuntu0.20.04.1.
    const addresses = matches(allLines.join('\n'), /(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])/g);
    for (const [address] of addresses) {
        const [a, b, c, d] = address.split('.').map(Number);
        assert.ok([a, b, c, d].every(part => part >= 0 && part <= 255), address);
        assert.ok(a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168), address);
    }
});

test('CTF flags use the restricted alphabet, except the single approved existing fixture', () => {
    const flags = matches(allLines.join('\n'), /CTF\{([^}]+)\}/g);
    const approved = 'M3t45pl01t_Pwn4g3_C0mpl3t3d!';
    // 2026-09-18 IPUSIRON承認：既存のこの1件だけ末尾の ! を許可する。
    for (const [, contents] of flags) {
        assert.ok(/^[A-Za-z0-9_]+$/.test(contents) || contents === approved, contents);
    }
    assert.deepEqual([...new Set(flags.map(item => item[1]))].sort(), [
        approved, 'R00t_4cc355_4ch13v3d_v14_5ud0_v1m'
    ].sort());
});
