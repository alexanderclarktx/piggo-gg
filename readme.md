__Piggo__ is an open-source web gaming platform! Play online at [piggo.gg](https://piggo.gg) 
<svg width="20" height="20" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="mask1">
      <rect width="200" height="200" fill="white" />
      <path d="M30 75 Q45 45 60 75" fill="none" stroke="black" stroke-width="9" />
      <path d="M100 75 Q115 45 130 75" fill="none" stroke="black" stroke-width="9" />
      <circle cx="70" cy="115" r="7" fill="black" />
      <circle cx="90" cy="115" r="7" fill="black" />
      <ellipse cx="80" cy="115" rx="30" ry="20" fill="none" stroke="black" stroke-width="6" />
    </mask>
  </defs>
  <circle cx="80" cy="90" r="80" fill="#FFC0CB" mask="url(#mask1)" />
  <path d="M10 52 C10 -10, 20 0, 60 12" fill="#FFC0CB" mask="url(#mask1)" />
  <path d="M150 52 C150 -10, 140 0, 100 12" fill="#FFC0CB" mask="url(#mask1)" />
</svg>

<p align="center">
  <img src="piggo-gg.gif" style="width:720px">
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
