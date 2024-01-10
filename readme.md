__Piggo Legends__ is a game engine for 2D multiplayer web games. Play online at [github.io](https://alexanderclarktx.github.io/piggo-legends/)

<p align="center">
  <img src="piggo-legends.gif" style="width:500px">
</p>

# Objectives

🎮 Games are easy to implement with Piggo Legends ECS

👾 Multiplayer is simple and performant

# Features

✅ ECS architecture

✅ physics engine & unit collision

✅ p2p webrtc & authoritative websocket server netcode

✅ WASD movement controls

✅ isometric projection from world coordinates

✅ entity onclick callbacks & npc ai behavior

# Development

|package|description|
|--|--|
|`docs`| resources & js bundle served statically by GitHub Pages
|`modules`| source libraries
|`server`| game server
|`web`| webpage

### setup

```bash
# install dependencies
bun install

# launch server and web
bun dev
```

### publishing to GitHub Pages
```bash
# generate minified js bundle
bun pages
```
