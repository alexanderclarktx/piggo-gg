import { SystemBuilder } from "@piggo-gg/core";

export const ChatSystem: SystemBuilder<"ChatSystem"> = ({
  id: "ChatSystem",
  init: ({ world }) => {

    return {
      id: "ChatSystem",
      onTick: () => { }
    }
  }
});
