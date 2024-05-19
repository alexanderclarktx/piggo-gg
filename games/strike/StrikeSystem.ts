import { Controlling, Entity, Player, SystemBuilder, Team, World } from "@piggo-gg/core";

const teamColors = [0xffffff, 0x00ffff];

type GameStates = "warmup" | "pre-round" | "round" | "planted" | "post-round" | "game-over";

const GameStateTimers: Record<GameStates, number> = {
  "warmup": -1,
  "pre-round": 10,
  "round": 120,
  "planted": 40,
  "post-round": 10,
  "game-over": 10,
}

const logToChat = (world: World, message: string) => {
  world.chatHistory.push(world.tick + 1, "game", message);
}

export const StrikeSystem: SystemBuilder<"StrikeSystem"> = {
  id: "StrikeSystem",
  init: ({ world }) => {

    let state: GameStates | undefined = undefined;

    return {
      id: "StrikeSystem",
      query: ["player"],
      onTick: (players: Entity<Player | Controlling | Team>[]) => {
        players.forEach((player) => {

          if (!state) {
            state = "warmup";
            GameStateHooks[state].onStart(world);
          }

          if (!player.components.team) {
            player.components.team = new Team({ team: 0 });
          }

          const team = player.components.team.data.team as number;

          // if (!player.components.controlling.data.entityId) {
          //   world.actionBuffer.push(world.tick + 1, player.id, spawnSkellyForNoob(player, teamColors[team]));
          // }
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
      logToChat(world, "warmup started");
    },
    onTick: (world) => {}
  },
  "pre-round": {
    onStart: (world) => {
      logToChat(world, "pre-round started");
    },
    onTick: (world) => {}
  },
  "round": {
    onStart: (world) => {
      logToChat(world, "round started");
    },
    onTick: (world) => {}
  },
  "planted": {
    onStart: (world) => {
      logToChat(world, "bomb planted");
    },
    onTick: (world) => {}
  },
  "post-round": {
    onStart: (world) => {
      logToChat(world, "post-round started");
    },
    onTick: (world) => {}
  },
  "game-over": {
    onStart: (world) => {
      logToChat(world, "game over");
    },
    onTick: (world) => {}
  },
}
