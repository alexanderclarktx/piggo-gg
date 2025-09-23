import { Entity, Three } from "@piggo-gg/core"


export const Sun = () => {

  const sun = Entity<Three>({
    id: "sun",
    components: {
      three: Three({
        init: async () => {

        }
      })
    }
  })
}
