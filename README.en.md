# Hacking Scene Simulator - Hacking Screens for Filming and Press Work

English · [日本語](README.md)

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/hacking-scene-simulator?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/hacking-scene-simulator?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/hacking-scene-simulator)
![GitHub license](https://img.shields.io/github/license/ipusiron/hacking-scene-simulator)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/hacking-scene-simulator/)

**Day006 - 100 Security Tools with Generative AI**

A screen simulator for the moment a film or a news segment needs a computer to look like it is being hacked. Six screens imitate the output of real tools, play back in fullscreen, and do absolutely nothing: no scanning, no traffic, no commands.

## 🌐 Demo

**👉 https://ipusiron.github.io/hacking-scene-simulator/**

Open it in a browser and pick a scene. It goes fullscreen straight away.

## 📸 Screenshots

<p align="center">
  <img src="assets/screenshot.png" alt="Selection screen">
</p>

> *Six scenes, a time limit and a sound switch. The footer links back to this repository.*

<p align="center">
  <img src="assets/screenshot2.png" alt="Linux Terminal">
</p>

> *Prompts are yellow; the fictional /etc/shadow hashes stay in ordinary green.*

<p align="center">
  <img src="assets/screenshot3.png" alt="Matrix Code Rain">
</p>

> *The bottom glyph of each column is white, and the trail above it fades into darker green.*

<p align="center">
  <img src="assets/screenshot4.png" alt="Wireshark Analyzer">
</p>

> *Frame headers, expert warnings and HTTP lines appear in yellow, orange and red.*

<p align="center">
  <img src="assets/screenshot5.png" alt="Mobile selection screen">
</p>

> *At 390px the page still scrolls down to the sixth button and the footer.*

## ✨ Features

- **Six believable scenes**: Linux Terminal, Matrix Code Rain, Retro Hacker, Nmap Scanner, Wireshark Analyzer, Metasploit Framework
- **Fullscreen playback**: framed for a camera rather than for a browser window
- **Sound effects**: beeps tied to the lines that matter, switchable on and off
- **Time limit**: 30 seconds to 10 minutes, or no limit at all
- **Safe to exit**: Esc or Q (tap or swipe up on touch devices). Keys held with Ctrl, Alt or Command pass through to the browser, so reloading and switching tabs still work.
- **Responsive**: usable from a phone to a large display
- **Japanese and English**: a button in the top right of the selection screen. `?lang=ja` and `?lang=en` also work, and the choice is remembered in the browser.

## 🖥️ The scenes

### 1. Linux Terminal

- A command-line session in the shape of a penetration test
- nmap, ssh and a privilege escalation through a sudo-allowed editor
- Runs all the way to a captured CTF flag

Every command, log line, hash and flag is fictional, and nothing is ever executed.

### 2. Matrix Code Rain

- Falling ones and zeros in the style of *The Matrix*
- Characters drop one at a time, each column at its own speed
- The leading glyph is white and the trail fades through green

The ones and zeros are decoration. They are not data and not a traffic log.

### 3. Retro Hacker

- An 80s-style hacker console
- Cyberpunk phrasing, progress bars and status lines
- A whole operation from intrusion to cleanup

The mission log on screen is invented from beginning to end.

### 4. Nmap Scanner

- The output of a network scan, phase by phase
- Discovered ports, service versions and host script results
- From host discovery through service detection to the summary line

The hosts and ports are fictional. No scan takes place.

### 5. Wireshark Analyzer

- The detail pane of a packet analyzer
- Ethernet, IPv4 and TCP fields expanded down to the flag bits
- Expert information and an unencrypted HTTP request

The packets and the HTTP log are fictional. Nothing is captured.

### 6. Metasploit Framework

- The console of an exploitation framework
- A random ASCII art banner out of five
- The banner through the first `msf6` prompt appears at once; the session after it plays line by line
- From launching an exploit to a Meterpreter session and a root shell

The commands and session logs are fictional. No attack and no command execution happens.

### Scene table

| Scene | What appears on screen | Lines |
|---|---|---|
| Linux Terminal | A session from port scan to privilege escalation | 44 |
| Matrix Code Rain | Ones and zeros falling down the screen | — |
| Retro Hacker | An 80s-style mission log | 39 |
| Nmap Scanner | The output of a network scan | 69 |
| Wireshark Analyzer | An expanded packet detail pane | 62 |
| Metasploit Framework | ASCII art and an exploitation session | 66–68 |

### Why the scene logs are not translated

Switching the language leaves the fictional logs in English. Three reasons.

- Real nmap, Wireshark and Metasploit output is English. Translated output reads as a prop immediately, and the footage loses the thing it was made for.
- The logs are picture, not prose. On camera the text is small and moves fast, so visual density matters more than comprehension.
- The numbers, Base64 strings, dates and CTF flags are cross-checked against each other by the tests. Rewriting the sentences would make those checks meaningless.

What the toggle covers is the interface: the selection screen, the settings, the exit hint and the remaining time.

## 📖 How to use it

### Basics

1. Open the page in a browser
2. Switch the language in the top right if you want to (日本語 / English)
3. Choose a time limit and whether sound is on
4. Pick one of the six scenes
5. Fullscreen playback starts by itself
6. Press Esc or Q to stop

### Settings

- **Time limit**: no limit, 30 seconds, 1 minute, 2 minutes, 5 minutes, 10 minutes
- **Sound effects**: on or off
- **Language**: Japanese or English. `?lang` wins, then the remembered choice, then the browser's own language.

### Ways out

- **Esc**: stops the simulation
- **Q or q**: stops the simulation
- Touch devices: tap or swipe up
- Leaving fullscreen by hand also stops it

Keys other than Esc and Q are not swallowed. F5, Tab and anything held with Ctrl, Alt or Command reach the browser as usual.
If fullscreen is refused, playback simply continues inside the ordinary browser window.

## 🎯 Where it is useful

Ways of using this tool in particular

- Choosing a scene that fits the length of a shot: people making video pick a scene to match the length of a cut. Estimated from the average interval between lines, all lines appear in about 44 seconds for Linux, about 60 seconds for Retro, about 55 seconds for Nmap and about 37 seconds for Wireshark (the intervals change randomly every time, so run it through once before the real take)
- A class that checks the numbers on the screen: the numbers in the logs are cross-checked by the tests, so the scenes work as material with an answer key. In the Nmap scene, the "Discovered open port" lines number 10, which matches "Scanning 10 services on 3 hosts". In the Wireshark scene, "74 bytes" is 592 bits, and the Epoch Time 1731648942 is 14:35:42 on November 15, 2024 (Japan time). It is practice for looking again at hacking screens in films and dramas from the same angle
- Practicing how to read the output without scanning anything: the results are for a fictional network (192.168.1.0/24), so you can practice reading Nmap's "PORT STATE SERVICE VERSION" columns or the layers of a Wireshark frame without sending anything to anyone's devices

General uses

- **Film and television**: the screen behind a hacking scene
- **Interviews and press work**: background footage for a security story
- **Teaching and talks**: illustrating what these tools look like
- **Demonstrations**: technical presentations
- **Events**: security conferences and similar

## 🔬 How it is built

- **Languages**: HTML5, CSS3 and JavaScript (ES6)
- **Browsers**: current Chrome, Firefox, Safari and Edge
- **Framework**: none; plain vanilla JavaScript
- **Audio**: Web Audio API
- **Layout**: CSS Grid and Flexbox

- **Messages**: `i18n.js` holds the Japanese and English dictionaries and applies them through `data-i18n` attributes and `t()`. The fictional logs in `scenes.js` are deliberately kept out of the dictionaries.
- **Data and colouring**: `scenes.js` keeps the data and the pure functions; line colours come from ordered regular expressions
- **Line feed**: a recursive `setTimeout` recomputes the delay for every line. The Metasploit banner is rendered in one go, both on the first pass and on every loop.
- **Matrix drawing**: `requestAnimationFrame`, with the fall halved under `prefers-reduced-motion`
- **Cleanup**: stopping or switching releases every pending line, restart, timer, frame and resize callback
- **Language switching**: `formatTimer` returns only `M:SS`, and the label word is attached at display time. The exit hint and the remaining time are redrawn on `languagechange`, so switching mid-playback never clears the screen.

## 🧪 Tests

With Node 22 or later, run the following. There are no dependencies and nothing to install.

```sh
npm test
```

`node --test` runs eight test files. GitHub Actions runs them on every push and pull request.

- Colouring rules, timer formatting and per-line delays
- The Metasploit banner burst, the per-line feed after it, the loop restart, and cancellation on stop or switch
- Nmap port totals, host counts, service counts and elapsed times
- Wireshark frame lengths, header lengths, timestamps and TCP options
- The weekday of the Linux log date, and the Metasploit architecture
- ASCII art character widths, the fictional IP addresses and the CTF flags
- The README scene table, image references and YAML metadata
- HTML structure, colour contrast and file formatting
- Matching keys across the two dictionaries, matching placeholders, missed translations, and every referenced key existing
- No Japanese leaking into the fictional logs, and no state decided by comparing displayed text

The point of all this is to keep what appears on screen coherent as the output of a real tool.
CTF flags use letters, digits and underscores, with one existing Metasploit flag allowed to end in `!`.

## 🔒 Security and privacy

This tool performs no attack, no traffic, no scan and no command execution.
Every log line, IP address, hash, CTF flag and credential on screen is fictional.
The Wireshark example deliberately carries `admin:password` as Base64: it is there to show that Basic authentication encodes rather than encrypts.

Once the page has loaded, playback needs no network at all. No cookies are used.
The only thing written to localStorage is `hacking-scene-simulator-language`, the chosen display language. The time limit, the sound setting and playback history are not stored.
Where storage is unavailable, the tool simply runs in the current language without remembering it.

Text is inserted with `textContent`, a meta CSP restricts where scripts and styles may come from, and the referrer policy is `no-referrer`.
`frame-ancestors` cannot be set through a meta tag, so it is absent.

## ⚠️ Notes

- This simulator exists for teaching and for press work.
- It performs no real hacking.
- The commands and logs on screen are imitations.
- It has no effect on any real system.

## 🔧 Customizing

The code is open source, and the following are straightforward to change.
Scene data lives in `scenes.js`; run `npm test` afterwards to confirm the data still adds up.

- Adding a new scene
- Changing the commands and logs
- Adjusting colours and animation speed
- Adding or changing sound effects

## 📁 Directory structure

```text
hacking-scene-simulator/
├── index.html                # Selection screen and simulator
├── i18n.js                   # Japanese and English dictionaries, and the switch
├── scenes.js                 # Fictional logs, colouring rules and timer helpers
├── script.js                 # DOM, playback, input and audio
├── style.css                 # Colours and responsive layout
├── assets/                   # Five screenshots used by the README
│   ├── screenshot.png
│   ├── screenshot2.png
│   ├── screenshot3.png
│   ├── screenshot4.png
│   └── screenshot5.png
├── test/                     # Eight dependency-free test files
│   ├── scenes.test.js
│   ├── scene-data.test.js
│   ├── playback.test.js
│   ├── html.test.js
│   ├── contrast.test.js
│   ├── readme.test.js
│   ├── i18n.test.js
│   └── format.test.js
├── .github/workflows/test.yml # CI on push and pull_request
├── package.json              # The npm test definition
├── LICENSE                   # MIT License
├── README.md                 # Japanese documentation
├── README.en.md              # English documentation
├── CLAUDE.md                 # Notes for development
└── ss.png                    # An older screen, kept but unreferenced
```

## 💻 Requirements

Current Chrome, Edge, Firefox and Safari are the targets.
Opening `index.html` over `file://` works too. Running the tests needs Node 22 or later.
Fullscreen and sound follow whatever the browser and the device allow.

## 📄 License

This project is released under the [MIT License](./LICENSE).

## 🛠️ About this tool

This tool was built as part of **100 Security Tools with Generative AI**, a project that produces and publishes one security-related tool a day for a hundred days with the help of AI.

For the project itself and the other tools, see the page below.

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
