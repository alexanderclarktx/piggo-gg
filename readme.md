__Piggo Legends__ is a platform for casual multiplayer games

# Objectives

Games are easy to implement using piggo-legends' ECS framework. Multiplayer is performant and easily integrated into games. Piggo Legends supports polyglot clients (desktop, web, mobile) across a variety of game types. Social tools like chat, possibly forums, voice, etc are available in a first class way.

# Development

### setup

```bash
# configure yarn
yarn set version stable
yarn plugin import workspace-tools

# install dependencies
yarn install

# serve the game locally
yarn start
```

### publishing to GitHub Pages
```
yarn pages
```

# Roadmap

```
- make frontend runnable in electron

- render game with pixi.js

- multiplayer implementation (webrtc?)
```
