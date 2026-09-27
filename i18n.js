'use strict';

// 選択画面と操作案内の文言。シーンに流れる架空のログは実物の出力を模した演出なので、
// 英字のまま scenes.js に残し、この辞書では扱わない。
const I18n = (() => {
    const ja = {
        'app.title': 'ハッキングシーンシミュレーター（Hacking Scene Simulator）',
        'app.description': '映画・TV番組の撮影や取材で使えるハッキング画面シミュレーター。6種類の画面をフルスクリーンで再生する',
        'app.headingMain': 'ハッキングシーンシミュレーター',
        'app.headingSub': '（Hacking Scene Simulator）',
        'app.langButton': 'English',
        'app.langAria': '言語を切り替える',
        'controls.timeLimit': '時間制限',
        'controls.sound': '音響効果',
        'time.none': '制限なし',
        'time.30s': '30秒',
        'time.1m': '1分',
        'time.2m': '2分',
        'time.5m': '5分',
        'time.10m': '10分',
        'sound.off': 'OFF',
        'sound.on': 'ON',
        'scene.linux.desc': '本格的なLinuxコマンドライン操作風',
        'scene.matrix.desc': '映画「マトリックス」風のコードレイン',
        'scene.retro.desc': '80年代風レトロハッカー画面',
        'scene.nmap.desc': 'ネットワークスキャンツール',
        'scene.wireshark.desc': 'パケット解析ツール風',
        'scene.metasploit.desc': 'ペネトレーションテストツール風',
        'footer.repo': 'GitHubでソースコードを見る',
        'exit.keyboard': 'ESCキーまたはQキーで終了',
        'exit.touch': 'タップまたは上スワイプで終了',
        'timer.remaining': '残り時間: {time}'
    };

    const en = {
        'app.title': 'Hacking Scene Simulator',
        'app.description': 'A hacking screen simulator for film and press shoots. Six fictional screens play back in fullscreen.',
        'app.headingMain': 'Hacking Scene Simulator',
        'app.headingSub': '(Screens for filming and press work)',
        'app.langButton': '日本語',
        'app.langAria': 'Switch language',
        'controls.timeLimit': 'Time limit',
        'controls.sound': 'Sound effects',
        'time.none': 'No limit',
        'time.30s': '30 seconds',
        'time.1m': '1 minute',
        'time.2m': '2 minutes',
        'time.5m': '5 minutes',
        'time.10m': '10 minutes',
        'sound.off': 'OFF',
        'sound.on': 'ON',
        'scene.linux.desc': 'A full Linux command-line session',
        'scene.matrix.desc': 'Code rain in the style of The Matrix',
        'scene.retro.desc': 'An 80s-style retro hacker screen',
        'scene.nmap.desc': 'A network scanning tool',
        'scene.wireshark.desc': 'A packet analyzer',
        'scene.metasploit.desc': 'A penetration testing framework',
        'footer.repo': 'View the source code on GitHub',
        'exit.keyboard': 'Press Esc or Q to exit',
        'exit.touch': 'Tap or swipe up to exit',
        'timer.remaining': 'Time left: {time}'
    };

    let language = 'ja';
    const STORAGE_KEY = 'hacking-scene-simulator-language';

    function t(key, values = {}) {
        const dict = language === 'en' ? en : ja;
        const message = dict[key];
        if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
        return message.replace(/\{(\w+)\}/g, (whole, name) =>
            (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole));
    }

    function apply(root = document) {
        document.documentElement.lang = language;
        document.title = t('app.title');
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', t('app.description'));
        root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
        for (const attr of ['aria-label', 'title', 'placeholder']) {
            root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) =>
                el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`))));
        }
    }

    function setLanguage(value) {
        if (!['ja', 'en'].includes(value)) return;
        language = value;
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ストレージが使えない環境では記憶しない */ }
        apply();
        document.dispatchEvent(new Event('languagechange'));
    }

    function init() {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ストレージが使えない環境では既定に従う */ }
        const query = new URLSearchParams(location.search).get('lang');
        const preferred = /^ja\b/i.test(navigator.language || '') ? 'ja' : 'en';
        language = [query, saved].find((value) => value === 'ja' || value === 'en') || preferred;
        apply();
    }

    return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module === 'object' && module.exports) module.exports = I18n;
