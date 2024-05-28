import { Controlling, Entity, Noob, Player, SystemBuilder, Team, TeamNumber, World, invokeSpawnSkelly } from "@piggo-gg/core";

const teamColors: Record<TeamNumber, number> = {
  1: 0xffffff,
  2: 0x00ffff
}

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

          // not controlling a character
          if (!player.components.controlling.data.entityId) {
            world.actionBuffer.push(world.tick + 1, player.id, invokeSpawnSkelly(player));
            spawnedPlayers.add(player.id);
          }

          // new player
          if (!spawnedPlayers.has(player.id)) {
            world.actionBuffer.push(world.tick + 1, player.id, invokeSpawnSkelly(player));
            spawnedPlayers.add(player.id);
          }

          if (!player.components.team) {
            player.components.team = new Team({ team: 1 });
          }

          const team = player.components.team.data.team as number;
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
