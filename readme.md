__Piggo Legends__ is a platform for casual multiplayer games. Play it online [here](https://alexanderclarktx.github.io/piggo-legends/)

<kbd>
<img src="screenshots/5.gif" style="width:500px">
</kbd>

# Objectives

Games are easy to implement using piggo-legends' game framework.

Multiplayer is performant, peer-to-peer, and easily integrated into games. 

Piggo Legends supports polyglot clients (desktop, web, mobile) across a variety of game types.

Social features like chat and voice have first class support.

# Features

#### Pixi.js
- [x] render to html canvas
- [x] render game objects
- [x] camera
- [x] animated sprites

#### netcode
- [x] WebRTC handshake works in browser
- [x] WebRTC transfer media
- [x] WebRTC connection over internet (fails for some network configurations like LTE)
- [x] WebRTC game state transfer
- [ ] WebRTC >2 players in one game

#### gameplay
- [x] character WASD movement
- [x] vehicle movement
- [ ] character can enter a vehicle
- [ ] weapons and damage
- [ ] character stats
- [ ] equippable items

# Development

### setup

```bash
# configure yarn
yarn set version stable
yarn plugin import workspace-tools

# install dependencies
yarn install

# serve the game locally (webpack serve)
yarn start
```

### publishing to GitHub Pages
```
yarn pages
```
