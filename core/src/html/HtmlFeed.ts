import { Entity, HDiv, HSVG, NPC, Player } from "@piggo-gg/core"

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
      backgroundImage: "",
      border: "2px solid white",
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

            const { died, diedFrom } = character.components.health?.data ?? {}

            if (died && diedFrom) {
              const headshot = diedFrom.includes("headshot")

              const key: FeedKey = `${died}-${player.id}-${diedFrom}-${headshot}`
              if (feedRecord[key]) continue

              feedRecord[key] = world.tick

              console.log("diedFrom", diedFrom)

              const p1 = world.players().find(p => diedFrom.includes(p.id))
              if (!p1) continue

              console.log("new feed item", key, feedRecord)

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
  return HDiv({
    style: {
      position: "relative",
      width: "100%",
      height: "30px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid gray"
    }
  },
    // HDiv({
    //   style: {
    //     position: "relative",
    //     color: "white",
    //     fontSize: "14px",
    //     marginLeft: "10px",
    //     marginRight: "5px",
    //     fontWeight: "bold"
    //   },
    //   text: p1.components.pc.data.name,
    // }),
    HSVG(
      "0 -4.5 41 41",
      '<path d="M37.024 14.080v2.464h-5.184q-0.384 3.808-3.088 6.512t-6.544 3.152v5.184h-2.464v-5.184q-3.84-0.448-6.528-3.136t-3.136-6.528h-5.152v-2.464h5.152q0.448-3.776 3.152-6.512t6.512-3.12v-5.184h2.464v5.184q3.808 0.384 6.528 3.12t3.104 6.512h5.184zM22.208 20.832v2.912q2.752-0.384 4.784-2.4t2.416-4.8h-2.944v-2.464h2.944q-0.384-2.752-2.416-4.768t-4.784-2.4v2.944h-2.464v-2.944q-2.752 0.384-4.784 2.4t-2.416 4.768h2.944v2.464h-2.944q0.384 2.784 2.416 4.8t4.784 2.4v-2.912h2.464zM20.96 13.312q0.832 0 1.44 0.592t0.608 1.424-0.608 1.44-1.44 0.608-1.424-0.608-0.592-1.44 0.592-1.424 1.424-0.592z"></path>'
    ),
    // HDiv({
    //   style: {
    //     position: "relative",
    //     // color: headshot ? "red" : "white",
    //     fontSize: "14px",
    //     marginRight: "5px",
    //     fontWeight: "bold"
    //   },
    //   text: headshot ? "🎯🔫" : "🔫",
    // }),
    // HDiv({
    //   style: {
    //     position: "relative",
    //     color: "white",
    //     fontSize: "14px",
    //     marginRight: "10px",
    //     fontWeight: "bold"
    //   },
    //   text: p2.components.pc.data.name,
    // })
  )
}
