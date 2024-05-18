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

const GameStateHooks: Record<GameStates, (world: World) => void> = {
  "warmup": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "warmup");
  },
  "pre-round": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "pre-round");
  },
  "round": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "round");
  },
  "planted": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "planted");
  },
  "post-round": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "post-round");
  },
  "game-over": (world) => {
    world.chatHistory.push(world.tick + 1, "GameState", "game-over");
  }
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
            GameStateHooks[state](world);
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
