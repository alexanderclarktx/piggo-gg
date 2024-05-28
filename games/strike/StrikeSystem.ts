import { Noob, SystemBuilder, Team, TeamColors, World, invokeSpawnSkelly } from "@piggo-gg/core";

type GameStates = "warmup" | "pre-round" | "round" | "planted" | "post-round" | "game-over";

const GameStateTimers: Record<GameStates, number> = {
  "warmup": -1,
  "pre-round": 10,
  "round": 120,
  "planted": 40,
  "post-round": 10,
  "game-over": 10,
}

export const StrikeSystem: SystemBuilder<"StrikeSystem"> = {
  id: "StrikeSystem",
  init: ({ world }) => {

    let state: GameStates = "warmup";
    const spawnedPlayers: Set<string> = new Set();

    GameStateHooks[state].onStart(world);

    return {
      id: "StrikeSystem",
      query: ["player"],
      onTick: (players: Noob[]) => {

        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[playerId]) {
            world.removeEntity(`skelly-${playerId}`);
            spawnedPlayers.delete(playerId);
          }
        })

        players.forEach((player) => {

          const { team, controlling } = player.components;

          // not controlling a character
          if (!controlling.data.entityId) {
            world.actionBuffer.push(world.tick + 1, player.id, invokeSpawnSkelly(player, TeamColors[team.data.team]));
            spawnedPlayers.add(player.id);
          }

          // new player
          if (!spawnedPlayers.has(player.id)) {
            world.actionBuffer.push(world.tick + 1, player.id, invokeSpawnSkelly(player, TeamColors[team.data.team]));
            spawnedPlayers.add(player.id);
          }
        });
      }
    }
  }
}

type Hooks = {
  onStart: (world: World) => void
  onTick: (world: World) => void
}

const GameStateHooks: Record<GameStates, Hooks> = {
  "warmup": {
    onStart: (world) => {
      world.log("warmup started");
    },
    onTick: (world) => {}
  },
  "pre-round": {
    onStart: (world) => {
      world.log("pre-round started");
    },
    onTick: (world) => {}
  },
  "round": {
    onStart: (world) => {
      world.log("round started");
    },
    onTick: (world) => {}
  },
  "planted": {
    onStart: (world) => {
      world.log("bomb planted");
    },
    onTick: (world) => {}
  },
  "post-round": {
    onStart: (world) => {
      world.log("post-round started");
    },
    onTick: (world) => {}
  },
  "game-over": {
    onStart: (world) => {
      world.log("game over");
    },
    onTick: (world) => {}
  },
}
