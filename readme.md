<img align="left" height="60" hspace="0" src="web/res/piggo.svg">

__Piggo__ is an open-source multiplayer web game! Play online at [piggo.gg](https://piggo.gg)

<br>

<p align="left">
  <img src="piggo-gg.gif" style="width:100%">
</p>

# Objectives

👾 multiplayer is smooth & performant

🎮 adding new game modes is easy

# Features

✅ server-authoritative netcode

✅ 2D graphics, sprites, and animations ([pixiJS](https://github.com/pixijs/pixijs))

✅ deterministic physics ([rapierJS](https://github.com/dimforge/rapier.js))

✅ ECS architecture

✅ WASD movement controls

✅ interactive entities & npc ai behavior

✅ switch between games

✅ networked chat

# Development

|package|description|
|--|--|
|`core`| core piggo source files
|`games`| piggo games
|`web`| webapp serving piggo
|`server`| game server
|`docs`| resources & js bundle served statically by GitHub Pages

### setup

```bash
# install dependencies
bun install

# launch server and web
bun dev
```
