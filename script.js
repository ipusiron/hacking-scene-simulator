let currentScene = null;
let animationTimeout = null;
let restartTimeout = null;
let matrixFrame = null;
let resizeTimeout = null;
let sceneGeneration = 0;
let isFullscreen = false;
let timeLimit = 0;
let timeRemaining = 0;
let timerInterval = null;
let soundEnabled = false;
let audioContext = null;

// Mobile touch handling
let touchStartTime = 0;
let touchStartY = 0;
const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Audio setup
function initAudio() {
    if (soundEnabled && !audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // 音声非対応でも映像の再生は続ける。
        }
    }
}

function playBeep(frequency = 800, duration = 100) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        // 音声の失敗を映像へ波及させない。
    }
}

// Matrix シーン用文字（バイナリコード）
const matrixChars = '01';

function startScene(sceneType) {
    const scene = Scenes.SCENES.find(item => item.id === sceneType);
    if (!scene) return;
    clearSceneTimers();
    sceneGeneration++;

    // 設定を取得
    timeLimit = parseInt(document.getElementById('timeLimit').value, 10);
    soundEnabled = document.getElementById('soundEffect').value === 'on';
    
    if (soundEnabled) {
        initAudio();
    }
    
    currentScene = sceneType;
    document.body.classList.add('is-playing');
    window.scrollTo(0, 0);
    document.getElementById('sceneSelector').style.display = 'none';
    document.getElementById('simulator').style.display = 'block';
    
    // タイマー表示
    if (timeLimit > 0) {
        timeRemaining = timeLimit;
        document.getElementById('timerDisplay').classList.add('is-visible');
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                stopScene();
            }
        }, 1000);
    }
    
    // フルスクリーンにする
    enterFullscreen();
    
    // 終了ヒントを更新
    updateExitHint();
    
    const content = document.getElementById('sceneContent');
    content.replaceChildren();
    
    content.className = scene.className;
    if (sceneType === 'matrix') {
        startMatrixScene();
    } else {
        const lines = sceneType === 'metasploit'
            ? Scenes.metasploitLines(Math.floor(Math.random() * Scenes.METASPLOIT_ARTS.length))
            : Scenes.SCENE_LINES[sceneType];
        startLineScene(sceneType, lines);
    }
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = Scenes.formatTimer(timeRemaining);
}

/** 5種類のログ画面を共通処理で再生する。待ち時間は各行で再評価する。 */
function startLineScene(sceneId, lines) {
    const content = document.getElementById('sceneContent');
    const generation = sceneGeneration;
    let lineIndex = 0;

    function appendLine() {
        if (generation !== sceneGeneration || currentScene !== sceneId) return;
        const text = lines[lineIndex++];
        const line = document.createElement('div');
        const lineClass = Scenes.classifyLine(sceneId, text);
        line.className = 'output-line' + (lineClass ? ' ' + lineClass : '');
        line.textContent = text;
        content.appendChild(line);

        if (soundEnabled) {
            if (sceneId === 'linux' && lineClass === 'command-prompt' && text.includes('#')) playBeep(1200, 50);
            if (sceneId === 'retro' && lineClass === 'success-text') playBeep(1500, 200);
            if (sceneId === 'nmap' && lineClass === 'success-text') playBeep(900, 100);
            if (sceneId === 'wireshark' && lineClass === 'warning-text') playBeep(600, 150);
            if (sceneId === 'metasploit' && text.includes('Meterpreter session')) playBeep(1000, 300);
        }

        content.scrollTop = content.scrollHeight;
        if (lineIndex < lines.length) {
            animationTimeout = setTimeout(appendLine, Scenes.nextDelay(sceneId, Math.random()));
        } else {
            animationTimeout = null;
            restartTimeout = setTimeout(() => {
                restartTimeout = null;
                if (generation !== sceneGeneration || currentScene !== sceneId) return;
                lineIndex = 0;
                content.replaceChildren();
                animationTimeout = setTimeout(appendLine, Scenes.nextDelay(sceneId, Math.random()));
            }, 5000);
        }
    }

    animationTimeout = setTimeout(appendLine, Scenes.nextDelay(sceneId, Math.random()));
}

function startMatrixScene() {
    const content = document.getElementById('sceneContent');
    // モバイル対応：画面サイズに応じて文字間隔を調整
    const charWidth = isMobile ? (window.innerWidth < 480 ? 12 : 16) : 20;
    const columns = Math.floor(window.innerWidth / charWidth);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 各列の状態を管理
    const columnStates = [];
    for (let i = 0; i < columns; i++) {
        columnStates.push({
            chars: [],
            speed: Math.random() * 6 + 3, // 30msあたり3-9の速度
            nextChar: Math.random() * 50
        });
    }
    let previousTime = null;

    // メインループ。時間差で移動量を補正し、端末のリフレッシュレートに依存させない。
    function drawFrame(timestamp) {
        if (currentScene !== 'matrix') return;
        const elapsed = previousTime === null ? 0 : Math.min(timestamp - previousTime, 60);
        previousTime = timestamp;
        const step = elapsed / 30 * (reducedMotion.matches ? 0.5 : 1);
        columnStates.forEach((column, colIndex) => {
            column.nextChar -= step;

            // 新しい文字を追加（画面上部から、または途中からランダムに）
            if (column.nextChar <= 0) {
                // 30%の確率で途中の位置から開始
                const startY = Math.random() < 0.3 ? Math.random() * window.innerHeight * 0.6 : 0;
                column.chars.push({
                    char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
                    y: startY,
                    opacity: 1,
                    element: null
                });
                column.nextChar = Math.random() * 15 + 5; // 文字生成間隔
            }

            column.chars.forEach(charObj => {
                charObj.y += column.speed * step;
            });
            // 画面外の文字を削除してから、残った列の最下端を先頭として選ぶ。
            column.chars = column.chars.filter(charObj => {
                if (charObj.y > window.innerHeight - charWidth) {
                    if (charObj.element) charObj.element.remove();
                    return false;
                }
                return true;
            });
            const headY = Math.max(...column.chars.map(charObj => charObj.y));

            // 既存の文字を更新
            column.chars.forEach(charObj => {
                // 最下端の白文字から上へ向かって緑を暗くする。
                charObj.opacity = Math.max(0.15, 1 - (headY - charObj.y) / window.innerHeight);
                if (!charObj.element) {
                    charObj.element = document.createElement('div');
                    charObj.element.className = 'matrix-char';
                    charObj.element.style.left = (colIndex * charWidth) + 'px';
                    content.appendChild(charObj.element);
                }
                charObj.element.textContent = charObj.char;
                charObj.element.style.top = charObj.y + 'px';
                charObj.element.classList.toggle('is-head', charObj.y === headY);
                charObj.element.style.setProperty('--matrix-green', String(Math.floor(255 * charObj.opacity)));

                // 文字をランダムに変更
                if (Math.random() < 1 - Math.pow(0.8, step)) {
                    charObj.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
            });
        });

        // 音響効果
        if (soundEnabled && Math.random() < 1 - Math.pow(0.95, step)) {
            playBeep(800 + Math.random() * 400, 30);
        }
        matrixFrame = requestAnimationFrame(drawFrame);
    }

    matrixFrame = requestAnimationFrame(drawFrame);
}

function enterFullscreen() {
    const element = document.documentElement;
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    if (!request) return;
    const generation = sceneGeneration;
    try {
        Promise.resolve(request.call(element)).then(() => {
            if (generation !== sceneGeneration || !currentScene) {
                exitFullscreen();
                return;
            }
            isFullscreen = true;
        }).catch(() => {
            isFullscreen = false;
        });
    } catch (e) {
        // 同期例外も処理し、全画面にできなくても再生は続ける。
        isFullscreen = false;
    }
}

function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    isFullscreen = false;
    if (!exit || !(document.fullscreenElement || document.webkitFullscreenElement)) return;
    try {
        Promise.resolve(exit.call(document)).catch(() => {
            // ブラウザー側ですでに解除済みでも停止処理を続ける。
        });
    } catch (e) {
        // 旧WebKitの同期例外に対応。
    }
}

/** 行送り・再開・タイマー・描画・リサイズの予約をすべて解放する。 */
function clearSceneTimers() {
    clearTimeout(animationTimeout);
    clearTimeout(restartTimeout);
    clearTimeout(resizeTimeout);
    clearInterval(timerInterval);
    cancelAnimationFrame(matrixFrame);
    animationTimeout = null;
    restartTimeout = null;
    resizeTimeout = null;
    timerInterval = null;
    matrixFrame = null;
    document.getElementById('timerDisplay').classList.remove('is-visible');
}

function stopScene() {
    currentScene = null;
    sceneGeneration++;
    clearSceneTimers();

    if (isFullscreen || document.fullscreenElement || document.webkitFullscreenElement) {
        exitFullscreen();
    }

    document.getElementById('simulator').style.display = 'none';
    document.getElementById('sceneSelector').style.display = 'flex';
    document.body.classList.remove('is-playing');
}

// キーボードイベント
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (currentScene) {
        if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
            stopScene();
            e.preventDefault();
        }
    }
});

// フルスクリーン変更イベント
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && currentScene) {
        stopScene();
    }
});

document.addEventListener('webkitfullscreenchange', function() {
    if (!document.webkitFullscreenElement && currentScene) {
        stopScene();
    }
});

// タッチイベント（モバイル対応）
document.addEventListener('touchstart', function(e) {
    if (currentScene) {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        if (e.cancelable) e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (currentScene) {
        const touchEndTime = Date.now();
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.abs(touchEndY - touchStartY);
        
        // タップ（短時間かつ短距離）またはダブルタップで終了
        if (touchDuration < 500 && touchDistance < 30) {
            stopScene();
        }
        
        // 上スワイプで終了
        if (touchDistance > 100 && (touchStartY - touchEndY) > 50) {
            stopScene();
        }
        
        if (e.cancelable) e.preventDefault();
    }
}, { passive: false });

// ウィンドウリサイズ時の対応（画面回転もここでまとめる）
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    if (currentScene === 'matrix') {
        // 少し遅延させてからMatrixシーンを再初期化
        resizeTimeout = setTimeout(() => {
            resizeTimeout = null;
            if (currentScene === 'matrix') {
                const content = document.getElementById('sceneContent');
                content.replaceChildren();
                cancelAnimationFrame(matrixFrame);
                startMatrixScene();
            }
        }, 200);
    }
});

// モバイルブラウザのアドレスバー表示/非表示に対応
window.addEventListener('scroll', function() {
    if (currentScene) {
        window.scrollTo(0, 0);
    }
});

// iOS Safari対応：音声再生の準備
document.addEventListener('touchstart', function() {
    if (soundEnabled && audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {
            // ユーザー操作のたびに再開を試みる。
        });
    }
});

// exitHintの表示テキストをデバイスに応じて変更
function updateExitHint() {
    const exitHint = document.getElementById('exitHint');
    if (exitHint) {
        if (isMobile) {
            exitHint.textContent = 'タップまたは上スワイプで終了';
        } else {
            exitHint.textContent = 'ESCキーまたはQキーで終了';
        }
    }
}

// 初期化時にヒントテキストを設定
document.addEventListener('DOMContentLoaded', function() {
    updateExitHint();
    document.querySelectorAll('.scene-button').forEach(button => {
        button.addEventListener('click', () => startScene(button.dataset.scene));
    });
});
