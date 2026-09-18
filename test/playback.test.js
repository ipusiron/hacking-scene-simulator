const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const Scenes = require('../scenes.js');

const source = readFileSync(join(__dirname, '..', 'script.js'), 'utf8');

// Execute the actual playback code with a minimal DOM and explicit timer queue.
// No browser dependencies or real waiting are needed for these regression tests.
function playback(scene, lines) {
    const content = {
        children: [],
        appendChild(line) { this.children.push(line); },
        replaceChildren() { this.children = []; },
        style: {},
        classList: { remove() {} }
    };
    const pending = new Map();
    let nextId = 0;
    const context = vm.createContext({
        Scenes,
        window: { addEventListener() {} },
        navigator: { maxTouchPoints: 0 },
        document: {
            addEventListener() {},
            getElementById() { return content; },
            createElement() { return {}; },
            body: { classList: { remove() {} } }
        },
        setTimeout(callback, delay) {
            const id = ++nextId;
            pending.set(id, { callback, delay });
            return id;
        },
        clearTimeout(id) { pending.delete(id); },
        clearInterval() {},
        cancelAnimationFrame() {}
    });
    vm.runInContext(source, context);
    context.sceneId = scene;
    context.sceneLines = lines;
    vm.runInContext('currentScene = sceneId; startLineScene(sceneId, sceneLines);', context);
    return {
        content, context, pending,
        texts() { return content.children.map(line => line.textContent); },
        step() {
            assert.equal(pending.size, 1, 'only one playback timer may be pending');
            const [id, timer] = pending.entries().next().value;
            pending.delete(id);
            timer.callback();
            return timer.delay;
        }
    };
}

for (let art = 0; art < Scenes.METASPLOIT_ARTS.length; art++) {
    test('Metasploit art ' + art + ': banner and first prompt appear without waiting', () => {
        const lines = Scenes.metasploitLines(art);
        const prompt = lines.indexOf('msf6 > use exploit/linux/http/apache_mod_cgi_bash_env_exec');
        assert.ok(prompt > 0, 'the known first prompt must exist');
        const player = playback('metasploit', lines);
        assert.deepEqual(player.texts(), lines.slice(0, prompt + 1));
        assert.match(player.content.children.at(-1).className, /command-prompt/);
        assert.equal(player.pending.size, 1);
        const delay = player.step();
        assert.ok(delay >= 600 && delay < 1800, 'original Metasploit delay remains unchanged');
        assert.deepEqual(player.texts(), lines.slice(0, prompt + 2));
        assert.match(player.content.children.at(-1).className, /info-text/);
        player.step();
        assert.deepEqual(player.texts(), lines.slice(0, prompt + 3));
    });
}

test('Metasploit repeats the instant introduction after its five-second pause', () => {
    const lines = Scenes.metasploitLines(0);
    const player = playback('metasploit', lines);
    const initial = player.texts();
    while (player.content.children.length < lines.length) player.step();
    assert.deepEqual(player.texts(), lines);
    assert.equal(player.step(), 5000);
    assert.deepEqual(player.texts(), initial);
    assert.equal(player.pending.size, 1);
    player.step();
    assert.deepEqual(player.texts(), lines.slice(0, initial.length + 1));
});

for (const scene of ['linux', 'retro', 'nmap', 'wireshark']) {
    test(scene + ': preserves delayed first line and one line per timer', () => {
        const lines = Scenes.SCENE_LINES[scene];
        const player = playback(scene, lines);
        assert.deepEqual(player.texts(), []);
        player.step();
        assert.deepEqual(player.texts(), lines.slice(0, 1));
        player.step();
        assert.deepEqual(player.texts(), lines.slice(0, 2));
    });
}

for (const afterCompletion of [false, true]) {
    test('Metasploit stop cancels ' + (afterCompletion ? 'restart' : 'line') + ' before Nmap starts', () => {
        const lines = Scenes.metasploitLines(0);
        const player = playback('metasploit', lines);
        if (afterCompletion) {
            while (player.content.children.length < lines.length) player.step();
        }
        const staleCallback = player.pending.values().next().value.callback;
        vm.runInContext('stopScene();', player.context);
        assert.equal(player.pending.size, 0);
        player.content.replaceChildren();
        vm.runInContext("currentScene = 'nmap'; startLineScene('nmap', Scenes.SCENE_LINES.nmap);", player.context);
        player.step();
        const firstLine = player.content.children[0];
        staleCallback();
        assert.equal(player.content.children[0], firstLine);
        assert.deepEqual(player.texts(), Scenes.SCENE_LINES.nmap.slice(0, 1));
        assert.equal(player.pending.size, 1);
    });
}
