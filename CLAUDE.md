# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hacking Scene Simulator** - a web application that creates realistic-looking hacking scenes for filming, journalism, and educational purposes. It's a web application with separated HTML, CSS, and JavaScript files that simulates 6 different cybersecurity scenarios.

## Architecture

- **Separated files**: HTML structure (`index.html`), CSS styles (`style.css`), and JavaScript logic (`script.js`)
- **Vanilla JavaScript**: No external dependencies or frameworks
- **Fullscreen simulation**: Uses Fullscreen API for immersive experience
- **Real-time animation**: Multiple animation loops for different scenes
- **Audio effects**: Web Audio API for optional sound effects

## Key Components

### Scene Types
1. **Linux Terminal** - Simulates penetration testing commands
2. **Matrix Code Rain** - Binary code falling animation
3. **Retro Hacker** - 80s-style cyberpunk interface
4. **Nmap Scanner** - Network scanning tool simulation
5. **Wireshark Analyzer** - Packet analysis display
6. **Metasploit Framework** - Penetration testing framework

### Core Functions
- `startScene(sceneType)` - Initializes and starts a simulation
- `stopScene()` - Cleanup and return to main menu
- Animation intervals for each scene type
- Fullscreen management
- Timer functionality with configurable limits

## Development Notes

- **CSS Styling**: All styles are in `style.css` with classes for different scene styling (`.terminal`, `.matrix`, `.retro`, etc.)
- **JavaScript Logic**: All functionality is in `script.js` with each scene having its own animation logic and data arrays
- **HTML Structure**: Clean semantic HTML in `index.html` with external file references
- Sound effects are generated using Web Audio API oscillators
- Matrix scene uses dynamic DOM manipulation for falling character effects
- All text content is pre-defined in JavaScript arrays

## Safety Features

- ESC key or Q key exits any simulation
- Automatic fullscreen exit stops simulation
- Timer limits prevent infinite sessions
- No actual network operations performed

## Customization Areas

- Scene content arrays (commands, logs, ASCII art)
- Animation speeds and intervals
- Color schemes in CSS
- Sound frequencies and durations
- Timer limits and controls