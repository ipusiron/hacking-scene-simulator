const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const I18n = require(path.join(repositoryRoot, 'i18n.js'));
const Scenes = require(path.join(repositoryRoot, 'scenes.js'));
const html = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repositoryRoot, 'script.js'), 'utf8');
const japanese = /[぀-ヿ一-鿿]/;

test('日本語と英語で、キーの集合が同じ', () => {
    const ja = Object.keys(I18n.ja);
    const en = Object.keys(I18n.en);
    assert.deepEqual(ja.filter((key) => !(key in I18n.en)), [], '英語に無いキーがある');
    assert.deepEqual(en.filter((key) => !(key in I18n.ja)), [], '日本語に無いキーがある');
    assert.ok(ja.length >= 24, 'キーが少なすぎる: ' + ja.length);
});

test('差し込みの名前が、日本語と英語で一致する', () => {
    const holes = (value) => [...String(value).matchAll(/\{(\w+)\}/g)].map((item) => item[1]).sort().join(',');
    const mismatched = Object.keys(I18n.ja).filter((key) => holes(I18n.ja[key]) !== holes(I18n.en[key]));
    assert.deepEqual(mismatched, []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
    const keys = new Set();
    for (const found of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(found[1]);
    assert.ok(keys.size >= 18, 'data-i18n が少なすぎる: ' + keys.size);
    assert.deepEqual([...keys].filter((key) => !(key in I18n.ja)), []);
});

test('script.js が呼ぶキーは、すべて辞書にある', () => {
    const keys = [...script.matchAll(/I18n\.t\(\s*'([\w.]+)'/g)].map((item) => item[1]);
    assert.ok(keys.length >= 3, 'I18n.t の呼び出しが見つからない');
    assert.deepEqual(keys.filter((key) => !(key in I18n.ja)), []);
    // 終了ヒントとタイマーは data-i18n では描き直せないので、必ず t() 経由にする。
    for (const key of ['exit.keyboard', 'exit.touch', 'timer.remaining']) {
        assert.ok(keys.includes(key), key);
    }
});

test('英語の辞書に、訳し忘れの日本語が残っていない', () => {
    // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
    const expected = new Set(['app.langButton']);
    const left = Object.keys(I18n.en).filter((key) => !expected.has(key) && japanese.test(I18n.en[key]));
    assert.deepEqual(left, []);
});

test('t() は差し込みを埋める。知らないキーは黙って通さない', () => {
    assert.equal(I18n.t('timer.remaining', { time: '0:05' }), '残り時間: 0:05');
    assert.equal(I18n.t('timer.remaining'), '残り時間: {time}');
    assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('シーンの説明は、scenes.js のデータと日本語の辞書で一致する', () => {
    for (const scene of Scenes.SCENES) {
        assert.equal(I18n.ja['scene.' + scene.id + '.desc'], scene.description, scene.id);
    }
});

test('画面に流れる架空のログは訳さず、英字のまま保つ', () => {
    // 実物のツール出力を模した演出なので、和訳すると雰囲気と整合性の両方が壊れる。
    // scene-data.test.js が半角文字だけを許すのと同じ契約をここでも縛る。
    const lines = [
        ...Object.values(Scenes.SCENE_LINES).flat(),
        ...Scenes.METASPLOIT_ARTS.flatMap((_, index) => Scenes.metasploitLines(index))
    ];
    assert.deepEqual(lines.filter((line) => japanese.test(line)), []);
    // 辞書側にもログ行を持ち込まない（演出はデータ、UIの文言は辞書という分担を保つ）。
    const messages = Object.values(I18n.ja).concat(Object.values(I18n.en));
    for (const message of messages) {
        assert.doesNotMatch(message, /^(?:root@|admin@|msf6|meterpreter|>>>|\[\*\]|Frame \d)/, message);
    }
});

test('状態の判定に、表示中の文言との一致を使っていない', () => {
    // 言語を変えると文字列が変わるため、終了ヒントとタイマーの文言で分岐してはいけない。
    assert.doesNotMatch(script, /=== '残り時間|=== 'ESC|=== 'タップ|textContent ===/);
    // 設定の読み取りは select の value（off/on、秒数）で行う。表示文字では行わない。
    assert.match(script, /soundEffect'\)\.value === 'on'/);
    assert.match(script, /parseInt\(document\.getElementById\('timeLimit'\)\.value, 10\)/);
    // Metasploit の一括表示の境界は、訳さないログ行の正規表現で見分ける。
    assert.match(script, /\/\^msf6\\b\//);
});

test('言語の切り替えで、文言を描き直す配線がある', () => {
    assert.match(script, /I18n\.init\(\)/);
    assert.match(script, /getElementById\('langToggle'\)\.addEventListener\('click'/);
    assert.match(script, /I18n\.setLanguage\(I18n\.language === 'ja' \? 'en' : 'ja'\)/);
    assert.match(script, /addEventListener\('languagechange', refreshDynamicText\)/);
});

test('i18n.js を他のスクリプトより先に読み込む', () => {
    assert.ok(html.indexOf('<script src="i18n.js"') < html.indexOf('<script src="scenes.js"'));
    assert.ok(html.indexOf('<script src="scenes.js"') < html.indexOf('<script src="script.js"'));
});

test('data-i18n は子要素を持たない要素にだけ付ける', () => {
    // apply() は textContent を置き換えるため、子要素があると消えてしまう。
    for (const found of html.matchAll(/<(\w+)\b[^>]*\sdata-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1>/g)) {
        assert.doesNotMatch(found[2], /</, found[0].slice(0, 80));
    }
    // 見出しは <br> を含むので、内側を2つの span に分けてある。
    assert.match(html, /<h1 class="selector-title"><span data-i18n="app\.headingMain">/);
    assert.doesNotMatch(html, /<h1 class="selector-title" data-i18n=/);
});
