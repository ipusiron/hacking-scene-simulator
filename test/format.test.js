const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const files = ['scenes.js', 'script.js', 'style.css', 'index.html'].concat(
    readdirSync(__dirname).filter(name => name.endsWith('.js')).map(name => 'test/' + name)
);
const minimum = { 'scenes.js': 300, 'script.js': 200, 'style.css': 400, 'index.html': 60 };
for (const file of files) {
    test(file + ': readable line length and minimum line count', () => {
        const lines = readFileSync(join(__dirname, '..', file), 'utf8').trimEnd().split(/\r?\n/);
        const limit = file === 'index.html' ? 250 : 200;
        for (const [index, line] of lines.entries()) {
            assert.ok([...line].length <= limit, file + ':' + (index + 1) + ' exceeds ' + limit);
        }
        if (minimum[file]) assert.ok(lines.length >= minimum[file], file + ' is unexpectedly compact');
    });
}
