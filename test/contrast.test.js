const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const css = readFileSync(join(__dirname, '../style.css'), 'utf8');
const root = css.match(/:root\s*\{([^}]+)\}/);
assert.ok(root, 'first :root block must exist');

function color(name) {
    const found = root[1].match(new RegExp('--' + name + ':\\s*(#[0-9a-f]{6})\\s*;', 'i'));
    assert.ok(found, 'missing six-digit CSS color: --' + name);
    return found[1];
}

function luminance(hex) {
    const components = hex.slice(1).match(/../g).map(part => {
        const value = parseInt(part, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return components[0] * 0.2126 + components[1] * 0.7152 + components[2] * 0.0722;
}

function contrast(foreground, background) {
    const first = luminance(color(foreground));
    const second = luminance(color(background));
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// Falling Matrix glyphs change green intensity as decoration, not readable text.
// Their per-frame intensity is deliberately outside the text contrast contract.
const textPairs = [
    ['fg-green','bg-black'],
    ['fg-green','bg-panel'],
    ['fg-green','bg-panel-dark'],
    ['fg-green-soft','bg-retro'],
    ['fg-wireshark','bg-wireshark'],
    ['fg-metasploit','bg-black'],
    ['line-prompt','bg-black'],
    ['line-error','bg-black'],
    ['line-success','bg-black'],
    ['line-info','bg-black'],
    ['line-warning','bg-black'],
    ['line-prompt','bg-wireshark'],
    ['line-error-wireshark','bg-wireshark'],
    ['line-success','bg-wireshark'],
    ['line-info','bg-wireshark'],
    ['line-warning','bg-wireshark'],
    ['msf-prompt','bg-black'],
    ['msf-info','bg-black'],
    ['msf-success','bg-black'],
    ['msf-error','bg-black'],
    ['footer-link','bg-panel'],
    ['footer-link','bg-panel-dark'],
    ['footer-link-hover','bg-panel']
];
const nonTextPairs = [['focus', 'bg-panel'], ['focus', 'bg-black'], ['fg-green', 'bg-panel']];
assert.equal(textPairs.length, 23);
assert.equal(nonTextPairs.length, 3);

for (const [kind, pairs, threshold] of [['text', textPairs, 4.5], ['non-text', nonTextPairs, 3]]) {
    for (const [foreground, background] of pairs) {
        test(kind + ': --' + foreground + ' on --' + background, () => {
            const ratio = contrast(foreground, background);
            assert.ok(ratio >= threshold, ratio.toFixed(4) + ' < ' + threshold);
        });
    }
}
