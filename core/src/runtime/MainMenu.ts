import { GameBuilder } from "@piggo-gg/core";

// TODO should this be a "scene" instead of a "game"
export const MainMenu: GameBuilder<"main-menu"> = ({

  id: "main-menu",
  init: () => ({
    id: "main-menu",
    entities: [

    ],
    systems: [],
  })
})
