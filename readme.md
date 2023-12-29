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
- [x] naive game state transfer
- [ ] comprehensive game state transfer [#43](https://github.com/alexanderclarktx/piggo-legends/issues/43)
- [ ] support >2 players in one game [#45](https://github.com/alexanderclarktx/piggo-legends/issues/45)

#### gameplay
- [x] character WASD movement
- [x] vehicle movement
- [x] character can enter a vehicle
- [x] physics-based movement
- [x] real isometric projection [#44](https://github.com/alexanderclarktx/piggo-legends/issues/44)
- [ ] handle complex user interactions [#42](https://github.com/alexanderclarktx/piggo-legends/issues/42)

# Development

### setup

```bash
# install dependencies
bun install

# serve the game locally (webpack serve)
bun dev
```

### publishing to GitHub Pages
```bash
bun pages
```
