const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { SCENES, SCENE_LINES, METASPLOIT_ARTS, metasploitLines } = require('../scenes.js');
const readme = readFileSync(join(__dirname, '../README.md'), 'utf8');

test('README scene table has six named rows with actual data line counts', () => {
    const section = readme.match(/### シーン一覧\s+([\s\S]*?)(?=\n## |\s*$)/);
    assert.ok(section);
    const rows = section[1].split('\n').filter(line => /^\|/.test(line));
    assert.match(rows[0], /^\|\s*シーン\s*\|\s*画面に出るもの\s*\|\s*行数\s*\|$/);
    assert.equal(rows.length, 8);
    const lengths = METASPLOIT_ARTS.map((_, index) => metasploitLines(index).length);
    for (const [index, scene] of SCENES.entries()) {
        const columns = rows[index + 2].split('|').slice(1, -1).map(value => value.trim());
        assert.equal(columns.length, 3);
        assert.equal(columns[0], scene.title);
        assert.ok(columns[1]);
        const count = scene.id === 'matrix' ? '—'
            : scene.id === 'metasploit' ? Math.min(...lengths) + '〜' + Math.max(...lengths)
            : String(SCENE_LINES[scene.id].length);
        assert.equal(columns[2], count, scene.title);
    }
});

test('all relative README images exist and all five screenshots are centered', () => {
    const images = [
        ...[...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map(item => item[1]),
        ...[...readme.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(item => item[1])
    ].filter(path => !/^(?:https?:|data:)/.test(path));
    assert.ok(images.length >= 5);
    for (const path of images) assert.ok(existsSync(join(__dirname, '..', path)), path);
    const centered = [...readme.matchAll(/<p align="center">\s*<img\b[^>]*src="(assets\/screenshot\d*\.png)"[^>]*>\s*<\/p>/g)];
    assert.equal(centered.length, 5);
    assert.deepEqual(centered.map(item => item[1]), [
        'assets/screenshot.png', 'assets/screenshot2.png', 'assets/screenshot3.png',
        'assets/screenshot4.png', 'assets/screenshot5.png'
    ]);
});

test('README YAML preserves block sequences and stable tool identifiers', () => {
    const lines = readme.split(/\r?\n/);
    assert.equal(lines[0], '<!--');
    assert.equal(lines[38], '-->');
    const yaml = lines.slice(0, 39).join('\n');
    for (const field of ['category_ja', 'category_en', 'tags']) {
        const index = lines.findIndex(line => line === field + ':');
        assert.ok(index >= 0 && index < 38, field);
        assert.match(lines[index + 1], /^  - /);
    }
    for (const [key, value] of Object.entries({
        id: 'day006', slug: 'hacking-scene-simulator',
        repo_url: 'https://github.com/ipusiron/hacking-scene-simulator',
        demo_url: 'https://ipusiron.github.io/hacking-scene-simulator/', hub: 'true'
    })) {
        const found = yaml.match(new RegExp('^' + key + ':\\s*"?([^"\\n]+)"?$', 'm'));
        assert.ok(found, key);
        assert.equal(found[1], value);
    }
});

test('README uses the current 100-tool project name and correct usage text', () => {
    assert.ok(readme.includes('生成AIで作るセキュリティツール100'));
    assert.ok(readme.includes('page_id=42163'));
    for (const wrong of ['セキュリティツールをAIで作ってみよう', 'ツール200', 'page_id=44607', 'Webー', 'ESCキーのみで終了']) {
        assert.ok(!readme.includes(wrong), wrong);
    }
});

const english = readFileSync(join(__dirname, '../README.en.md'), 'utf8');

test('both READMEs cross-link each other and carry no YAML front matter twice', () => {
    assert.match(readme.split(/\r?\n/)[42], /^\[English\]\(README\.en\.md\) · 日本語$/);
    assert.match(english.split(/\r?\n/)[2], /^English · \[日本語\]\(README\.md\)$/);
    // The hub reads the YAML from README.md only; the English file must not repeat it.
    assert.doesNotMatch(english, /^<!--/);
    assert.ok(english.includes('Day006 - 100 Security Tools with Generative AI'));
    assert.ok(english.includes('page_id=42163'));
});

test('README.en.md is English prose that still names every scene and both languages', () => {
    const body = english.split(/\r?\n/).filter(line => !/^\s*[|>]/.test(line)).join('\n');
    // Only the language toggle wording and the cross-link may be Japanese.
    const allowed = new Set(['日本語']);
    const left = [...body.matchAll(/[぀-ヿ一-鿿]+/g)]
        .map(item => item[0]).filter(word => !allowed.has(word));
    assert.deepEqual([...new Set(left)], []);
    for (const scene of SCENES) assert.ok(english.includes(scene.title), scene.title);
    for (const file of ['i18n.js', 'README.en.md', 'i18n.test.js']) assert.ok(english.includes(file), file);
    assert.ok(english.includes('hacking-scene-simulator-language'));
});

test('both READMEs describe the same stored value and the same file count', () => {
    for (const [name, text, phrase] of [['README.md', readme, '8ファイル'], ['README.en.md', english, 'eight test files']]) {
        assert.ok(text.includes('hacking-scene-simulator-language'), name);
        assert.ok(text.includes(phrase), name + ': ' + phrase);
        // The old claim that nothing at all is stored would now be false.
        assert.ok(!/localStorageやCookieも使いません/.test(text), name);
    }
});

test('MIT license exists and is linked locally from README', () => {
    assert.equal(readFileSync(join(__dirname, '../LICENSE'), 'utf8').split(/\r?\n/)[0], 'MIT License');
    assert.match(readme, /\[MITライセンス\]\(\.\/LICENSE\)/);
});

test('ユースケースの「このツールならではの使い方」の数値は scenes.js と同じ（日英）', () => {
    const { SCENE_LINES, nextDelay } = require('../scenes.js');
    const readmeEn = readFileSync(join(__dirname, '../README.en.md'), 'utf8');
    // 間隔は rand*A+B（rand は0〜1）なので、平均は rand=0 と rand=1 の中間
    const seconds = id => Math.round(SCENE_LINES[id].length * (nextDelay(id, 0) + nextDelay(id, 1)) / 2 / 1000);
    const [linux, retro, nmap, wireshark] = ['linux', 'retro', 'nmap', 'wireshark'].map(seconds);
    assert.deepEqual([linux, retro, nmap, wireshark], [44, 60, 55, 37]);
    assert.ok(readme.includes(`Linuxは約${linux}秒、Retroは約${retro}秒、Nmapは約${nmap}秒、Wiresharkは約${wireshark}秒`));
    assert.ok(readmeEn.includes(`about ${linux} seconds for Linux, about ${retro} seconds for Retro, about ${nmap} seconds for Nmap and about ${wireshark} seconds for Wireshark`));
    const open = SCENE_LINES.nmap.filter(line => line.startsWith('Discovered open port')).length;
    assert.equal(open, 10);
    assert.ok(SCENE_LINES.nmap.includes(`Scanning ${open} services on 3 hosts`));
    assert.ok(readme.includes(`「Discovered open port」の行を数えると${open}行で、「Scanning ${open} services on 3 hosts」と合う`));
    assert.ok(readmeEn.includes(`the "Discovered open port" lines number ${open}, which matches "Scanning ${open} services on 3 hosts"`));
    assert.ok(SCENE_LINES.wireshark.includes('Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)'));
    assert.equal(74 * 8, 592);
    const epochLine = SCENE_LINES.wireshark.find(line => line.includes('Epoch Time: 1731648942.'));
    assert.ok(epochLine);
    const jst = new Date(1731648942 * 1000 + 9 * 3600 * 1000).toISOString().slice(0, 19);
    assert.equal(jst, '2024-11-15T14:35:42');
    assert.ok(readme.includes('Epoch Timeの1731648942は2024年11月15日14時35分42秒（日本時間）'));
    assert.ok(readmeEn.includes('the Epoch Time 1731648942 is 14:35:42 on November 15, 2024 (Japan time)'));
    assert.ok(SCENE_LINES.nmap.some(line => line.startsWith('Scanning 192.168.1.0/24')));
});
