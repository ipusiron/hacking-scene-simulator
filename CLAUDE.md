# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hacking Scene Simulator** - a web application that creates realistic-looking hacking scenes for filming, journalism, and educational purposes. It's a web application with separated HTML, CSS, and JavaScript files that simulates 6 different cybersecurity scenarios.

## Architecture

- **Separated files**: HTML structure, CSS styles, pure scene data/rules (scenes.js), and DOM behavior (script.js)
- **Vanilla JavaScript**: No external dependencies or frameworks
- **Fullscreen simulation**: Uses Fullscreen API for immersive experience
- **Real-time animation**: Recursive timeouts for text; requestAnimationFrame for Matrix
- **Audio effects**: Web Audio API for optional sound effects

### Files

- index.html / style.css / script.js: accessible selection UI, playback, input and sound
- scenes.js: SCENES, SCENE_LINES, METASPLOIT_ARTS, METASPLOIT_TAIL and pure functions
- assets/: five viewport screenshots; ss.png remains as an unused historical image
- test/: scenes, scene-data, html, contrast, readme and format tests
- package.json: dependency-free npm test command
- .github/workflows/test.yml: Test workflow on push and pull_request, Node 22
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

#### scenes.js (no DOM, classic script and CommonJS)

- SCENES / SCENE_LINES: six descriptors and four fixed log arrays
- metasploitLines(artIndex): deterministic art plus shared tail, invalid indices use zero
- classifyLine(sceneId, text): ordered regular expressions, no ambiguous substring coloring
- formatTimer(seconds): remaining time in M:SS, negatives clamped to zero
- nextDelay(sceneId, rand): per-line randomized delay supplied by the DOM layer

#### script.js (DOM behavior)

- startScene(sceneType): initialize settings, clear old timers and start playback
- startLineScene(sceneId, lines): shared text playback and tracked five-second restart
- startMatrixScene(): requestAnimationFrame, white bottom glyph per column
- clearSceneTimers() / stopScene(): release all timeouts, interval and animation frame
- enterFullscreen() / exitFullscreen(): standard and WebKit APIs with rejection handling
- updateTimerDisplay() / updateExitHint(): Japanese labels consistent with README

## Development Notes

- **CSS Styling**: All styles are in `style.css` with classes for different scene styling (`.terminal`, `.matrix`, `.retro`, etc.)
- **JavaScript Logic**: scenes.js owns data and rules; script.js owns DOM, animation, input and audio
- **HTML Structure**: Clean semantic HTML in `index.html` with external file references
- Sound effects are generated using Web Audio API oscillators
- Matrix scene uses dynamic DOM manipulation for falling character effects
- All text content is pre-defined in JavaScript arrays
- Open index.html directly in browser; HTTP serving also works, with no build step
- Run npm test (node --test, no dependencies) on Node 22 or later
- Keep classic deferred scripts in scenes.js then script.js order; do not use ES modules
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
