# Ember

A quiet, offline journaling app designed to feel warm, personal, and distraction-free.

Ember was created from a simple frustration: most journaling apps either felt overly complicated, subscription-heavy, or too focused on productivity. I wanted something that felt closer to opening a notebook at the end of the day and writing down a few thoughts.

Built with React and Tauri, Ember is lightweight, fast, and stores everything locally.

---

## Features

* One page per day
* Offline-first experience
* Local Markdown storage
* Warm, minimal themes
* Distraction-free writing environment
* Native desktop application for Linux and Windows

---

## Screenshots

Add screenshots here.

### Home

![Home](screenshots/home.png)

### Writing View

![Writing View](screenshots/editor.png)

### Themes

![Themes](screenshots/themes.png)

---

## Why Ember?

I enjoy journaling, but I never really found a journaling app that felt right.

Most of the options I tried were either cluttered, subscription-based, or packed with features I didn't need. Ember started as a personal project to create the kind of journaling experience I wanted for myself: simple, quiet, and comfortable to write in.

---

## Installation

### Linux (.deb)

Download the latest release from the Releases section and install:

```bash
sudo apt install ./ember_*.deb
```

### Windows

Download the latest installer from the Releases section and run it normally.

---

## Building From Source

### Prerequisites

* Node.js
* Rust
* Tauri

### Clone

```bash
git clone https://github.com/ayaanable/ember.git
cd ember
```

### Install Dependencies

```bash
npm install
```

### Run Development Build

```bash
npm run tauri dev
```

### Create Production Build

```bash
npm run tauri build
```

---

## Technology Stack

* React
* TypeScript
* Tauri
* Rust
* Tailwind CSS

---

## Status

Ember is still in active development and continues to evolve as I use it daily and discover ways to improve the journaling experience.

---

## License

MIT License
