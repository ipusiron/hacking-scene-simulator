const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { SCENES } = require('../scenes.js');
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const script = readFileSync(join(__dirname, '../script.js'), 'utf8');

function meta(name) {
    const tags = html.match(/<meta\b[^>]*>/gi) || [];
    const tag = tags.find(value => value.includes('="' + name + '"'));
    assert.ok(tag, 'missing meta: ' + name);
    return tag;
}

test('viewport permits zoom and retains device width', () => {
    assert.match(meta('viewport'), /width=device-width/);
    assert.doesNotMatch(meta('viewport'), /user-scalable\s*=\s*no|maximum-scale/i);
});

test('CSP uses external scripts and styles without unsupported frame directives', () => {
    const csp = meta('Content-Security-Policy');
    for (const directive of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "object-src 'none'"]) {
        assert.ok(csp.includes(directive), directive);
    }
    assert.doesNotMatch(csp, /frame-ancestors|'unsafe-inline'|'unsafe-eval'/);
    assert.match(meta('referrer'), /content="no-referrer"/);
    assert.match(meta('description'), /content="[^"]+"/);
});

test('classic deferred scripts load data before DOM behavior', () => {
    const tags = html.match(/<script\b[^>]*>/gi) || [];
    assert.equal(tags.length, 2);
    assert.match(tags[0], /src="scenes\.js"/);
    assert.match(tags[1], /src="script\.js"/);
    for (const tag of tags) {
        assert.match(tag, /\bdefer\b/);
        assert.doesNotMatch(tag, /type\s*=\s*["']module/);
    }
});

test('HTML contains no inline event handlers or inline styles', () => {
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
    assert.doesNotMatch(html, /\sstyle\s*=/i);
});

test('both controls have explicit labels and all required identifiers exist', () => {
    const labels = [...html.matchAll(/<label\b[^>]*for="([^"]+)"/g)];
    assert.equal(labels.length, 2);
    assert.deepEqual(labels.map(item => item[1]), ['timeLimit', 'soundEffect']);
    for (const [, id] of labels) assert.ok(html.includes('id="' + id + '"'), id);
    for (const id of ['sceneSelector', 'simulator', 'sceneContent', 'exitHint', 'timerDisplay', 'timeLimit', 'soundEffect']) {
        assert.equal([...html.matchAll(new RegExp('id="' + id + '"', 'g'))].length, 1, id);
    }
});

test('six native scene buttons agree with the data titles and descriptions', () => {
    const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    assert.equal(buttons.length, 6);
    for (const [index, [, attributes, contents]] of buttons.entries()) {
        const scene = SCENES[index];
        assert.match(attributes, /type="button"/);
        assert.ok(attributes.includes('data-scene="' + scene.id + '"'), scene.id);
        assert.doesNotMatch(attributes, /\brole="button"|\btabindex=/);
        assert.doesNotMatch(attributes, /simulation scene/);
        assert.ok(contents.includes('<h3>' + scene.title + '</h3>'));
        assert.ok(contents.includes('<p>' + scene.description + '</p>'));
        const aria = attributes.match(/aria-label="([^"]+)"/);
        if (aria) assert.ok(contents.replace(/<[^>]+>/g, '').includes(aria[1]));
    }
});

test('one main heading, JavaScript fallback and initial exit hint exist', () => {
    assert.match(html, /<main\b/);
    assert.match(html, /<noscript>このツールの利用には JavaScript が必要です。<\/noscript>/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /id="exitHint">ESCキーまたはQキーで終了/);
});

test('repository footer follows every button inside the selection main', () => {
    const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/);
    assert.ok(footer);
    assert.ok(footer.index > html.indexOf('<main'));
    assert.ok(footer.index < html.indexOf('</main>'));
    assert.ok(footer.index > html.lastIndexOf('</button>'));
    assert.match(footer[1], /href="https:\/\/github\.com\/ipusiron\/hacking-scene-simulator"/);
    assert.doesNotMatch(footer[1], /target="_blank"/);
});

test('DOM script excludes unsafe insertion and inline color assignments', () => {
    for (const forbidden of [/onclick/, /innerHTML\s*=/, /alert\s*\(/, /\.style\.color/, /document\.write/]) {
        assert.doesNotMatch(script, forbidden);
    }
    // Matrix positions use CSSOM top/left because coordinates vary per frame.
    // These property assignments are not inline style attributes blocked by the meta CSP.
    assert.match(script, /\.style\.top/);
    assert.match(script, /\.style\.left/);
    assert.match(script, /replaceChildren\(\)/);
    assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|document\.cookie/);
});
