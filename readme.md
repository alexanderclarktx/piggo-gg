__Piggo Legends__ is a game engine for p2p web games. Play it online at [github.io](https://alexanderclarktx.github.io/piggo-legends/)

<p align="center">
  <img src="screenshots/5.gif" style="width:500px">
</p>

# Objectives

🎮 Games are easy to implement with Piggo Legends ECS

👾 Multiplayer is simple and performant

# Upcoming Features

#### netcode
- [x] p2p webrtc handshake in browser
- [x] simple game state transfer
- [ ] comprehensive game state transfer [#43](https://github.com/alexanderclarktx/piggo-legends/issues/43)
- [ ] support >2 players in one game [#45](https://github.com/alexanderclarktx/piggo-legends/issues/45)

#### gameplay
- [x] WASD character movement
- [x] physics-based vehicle movement
- [x] real isometric projection [#44](https://github.com/alexanderclarktx/piggo-legends/issues/44)
- [ ] handle complex user interactions [#42](https://github.com/alexanderclarktx/piggo-legends/issues/42)

# Development

|package|description|
|--|--|
|`docs`| minified js bundle and resources served statically by GitHub Pages
|`modules`| piggo-legends libraries
|`server`| WebSocket game server
|`web`| React webpage

### setup

```bash
# install dependencies
bun install

# launches server and web
bun dev
```

### publishing to GitHub Pages
```bash
# generates minified js bundle
bun pages
```
