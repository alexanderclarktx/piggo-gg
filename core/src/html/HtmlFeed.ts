import { Entity, HButton, HDiv, HImg, HText, NPC, Player } from "@piggo-gg/core"

export const HtmlFeed = (): Entity => {
  let init = false

  type FeedKey = `${number}-${string}-${string}-${boolean}`
  let feedRecord: Record<FeedKey, number> = {}

  const wrapper = HDiv({
    style: {
      width: "300px",
      height: "150px",
      right: "15px",
      top: "15px",
      flexDirection: "column",
      display: "flex"
    }
  })

  return Entity({
    id: "htmlFeed",
    components: {
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            document.body.appendChild(wrapper)
            console.log("HtmlFeed mounted")
            init = true
          }

          for (const player of world.players()) {
            const character = player.components.controlling.getCharacter(world)
            if (!character) continue

            const { died, diedFrom, diedReason } = character.components.health?.data ?? {}

            if (died && diedFrom && diedReason) {
              const headshot = diedReason === "headshot"

              const key: FeedKey = `${died}-${player.id}-${diedFrom}-${headshot}`
              if (feedRecord[key]) continue

              feedRecord[key] = world.tick

              const p1 = world.players().find(p => diedFrom.includes(p.id))
              if (!p1) continue

              const item = FeedItem(p1, player, headshot)
              wrapper.appendChild(item)
            }
          }
        }
      })
    }
  })
}

const FeedItem = (p1: Player, p2: Player, headshot: boolean) => {
  return HButton({
    style: {
      position: "relative",
      width: "100%",
      height: "30px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid gray",
      marginTop: "8px"
    }
  },
    HText({
      style: {
        position: "relative",
        color: "white",
        fontSize: "22px",
        marginRight: "8px"
      },
      text: p1.components.pc.data.name,
    }),
    HImg({
      src: "pistol.svg",
      style: {
        width: "32px",
        position: "relative",
        transform: "translate(0%, 0%)",
        marginRight: "8px",
      }
    }),
    headshot ? HImg({
      src: "headshot.svg",
      style: {
        width: "28px",
        position: "relative",
        transform: "translate(0%, 0%)",
        marginRight: "8px",
      }
    }) : undefined,
    HText({
      style: {
        position: "relative",
        color: "white",
        fontSize: "22px",
        marginRight: "10px"
      },
      text: p2.components.pc.data.name,
    })
  )
}
