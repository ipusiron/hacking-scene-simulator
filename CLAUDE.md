# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hacking Scene Simulator** - a web application that creates realistic-looking hacking scenes for filming, journalism, and educational purposes. It's a web application with separated HTML, CSS, and JavaScript files that simulates 6 different cybersecurity scenarios.

## Architecture

- **Separated files**: HTML structure, CSS styles, messages (i18n.js), pure scene data/rules (scenes.js), and DOM behavior (script.js)
- **Vanilla JavaScript**: No external dependencies or frameworks
- **Fullscreen simulation**: Uses Fullscreen API for immersive experience
- **Real-time animation**: Recursive timeouts for text; requestAnimationFrame for Matrix
- **Audio effects**: Web Audio API for optional sound effects

### Files

- index.html / style.css / script.js: accessible selection UI, playback, input and sound
- i18n.js: Japanese and English dictionaries, data-i18n application and the stored choice
- scenes.js: SCENES, SCENE_LINES, METASPLOIT_ARTS, METASPLOIT_TAIL and pure functions
- assets/: five viewport screenshots; ss.png remains as an unused historical image
- test/: scenes, scene-data, playback, html, contrast, readme, i18n and format tests
- package.json: dependency-free npm test command
- .github/workflows/test.yml: Test workflow on push and pull_request, Node 22
- README.md / README.en.md: Japanese and English documentation, cross-linked at the top
- LICENSE: MIT License, Copyright (c) 2025 ipusiron

## Key Components

### Scene Types

1. **Linux Terminal** - Simulates penetration testing commands
2. **Matrix Code Rain** - Binary code falling animation
3. **Retro Hacker** - 80s-style cyberpunk interface
4. **Nmap Scanner** - Network scanning tool simulation
5. **Wireshark Analyzer** - Packet analysis display
6. **Metasploit Framework** - Penetration testing framework

### Core Functions

#### i18n.js (no scene data, classic script and CommonJS)

- ja / en: the interface wording only. Scene log lines stay in scenes.js and are never translated
- t(key, values): fills {name} placeholders and throws on an unknown key
- apply(root): sets documentElement.lang, the title, the meta description, data-i18n text and
  data-i18n-aria-label / -title / -placeholder attributes
- init(): ?lang, then the localStorage choice, then navigator.language
- setLanguage(value): stores the choice and dispatches languagechange on document
- Never put data-i18n on an element with child nodes; apply() replaces textContent

#### scenes.js (no DOM, classic script and CommonJS)

- SCENES / SCENE_LINES: six descriptors and four fixed log arrays
- metasploitLines(artIndex): deterministic art plus shared tail, invalid indices use zero
- classifyLine(sceneId, text): ordered regular expressions, no ambiguous substring coloring
- formatTimer(seconds): remaining time in M:SS, negatives clamped to zero
- nextDelay(sceneId, rand): per-line randomized delay supplied by the DOM layer

#### script.js (DOM behavior)

- startScene(sceneType): initialize settings, clear old timers and start playback
- startLineScene(sceneId, lines): shared text playback and tracked five-second restart
  - Metasploit renders its startup banner through the first msf6 prompt immediately on every cycle
  - Subsequent Metasploit lines and all other text scenes retain per-line delays
- startMatrixScene(): requestAnimationFrame, white bottom glyph per column
- clearSceneTimers() / stopScene(): release all timeouts, interval and animation frame
- enterFullscreen() / exitFullscreen(): standard and WebKit APIs with rejection handling
- updateTimerDisplay() / updateExitHint(): wording comes from I18n.t, not from literals
- refreshDynamicText(): redraws the exit hint and the timer on languagechange, because those two
  are written by script.js rather than by data-i18n. Playback itself is untouched, so switching
  language mid-scene never clears the screen

## Development Notes

- **CSS Styling**: All styles are in `style.css` with classes for different scene styling (`.terminal`, `.matrix`, `.retro`, etc.)
- **JavaScript Logic**: scenes.js owns data and rules; script.js owns DOM, animation, input and audio
- **HTML Structure**: Clean semantic HTML in `index.html` with external file references
- Sound effects are generated using Web Audio API oscillators
- Matrix scene uses dynamic DOM manipulation for falling character effects
- All text content is pre-defined in JavaScript arrays
- Open index.html directly in browser; HTTP serving also works, with no build step
- Run npm test (node --test, no dependencies) on Node 22 or later
- Keep classic deferred scripts in i18n.js, scenes.js then script.js order; do not use ES modules
- Scene logs imitate real English tool output, and scene-data.test.js allows half-width characters
  only. Do not translate them, and do not move them into the i18n dictionaries
- Decide state from select values, dataset marks or the shape of a log line, never from displayed
  wording, because the wording changes with the language
- Matrix falls at half speed with prefers-reduced-motion; the filming effect remains active
- Selection scrolls normally; body.is-playing disables page scrolling only during playback

## Safety Features

- ESC key or Q key exits any simulation
- Ctrl/Alt/Command combinations and other non-exit keys pass through to the browser
- Touch devices exit with a tap or upward swipe; touch detection uses capabilities, not UA
- Automatic fullscreen exit stops simulation
- Timer limits prevent infinite sessions
- No actual network operations performed
- All logs, addresses, hashes, flags and credentials are fictional fixtures
- textContent, external event listeners and meta CSP avoid executable inline content
- A repository footer is inside the selection screen and absent during playback

## Customization Areas

- Scene content arrays in scenes.js (commands, logs, ASCII art)
- After editing scene data, ensure test/scene-data.test.js passes: ports, lengths, timestamps,
  weekdays, architecture, RFC1918 addresses and fictional flags must remain consistent
- Keep the existing Metasploit flag ending in ! as the one explicitly approved alphabet exception
- Animation speeds and intervals
- Color schemes in CSS
- Sound frequencies and durations
- Timer limits and controls
