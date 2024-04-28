import { GameBuilder } from "@piggo-gg/core";

export const MainMenu: GameBuilder<"main-menu"> = ({

  id: "main-menu",
  init: () => ({
    id: "main-menu",
    entities: [],
    systems: [],
  })
})
