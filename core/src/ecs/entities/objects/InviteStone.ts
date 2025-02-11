import { Actions, Clickable, Collider, Debug, Entity, Position, Renderable, XY, env, pixiCircle } from "@piggo-gg/core"
import toast from "react-hot-toast"

export type InviteStoneProps = {
  pos: XY
  tint?: number
}

const hosts = {
  dev: "http://localhost:8000",
  production: "https://piggo.gg"
}

export const InviteStone = ({ pos, tint }: InviteStoneProps): Entity => {
  const portal = Entity<Renderable>({
    id: `invite-stone`,
    components: {
      position: Position(pos),
      debug: Debug(),
      collider: Collider({
        shape: "line", points: [
          -32, 8,
          0, -8,
          32, 8,
          0, 24,
          -32, 8
        ]
      }),
      actions: Actions({
        click: ({ world }) => {
          if (!world.client) return

          let url = ""
          if (world.client.lobbyId) {
            url = `${hosts[env]}/?join=${world.client.lobbyId}`
            navigator.clipboard.writeText(url)
            toast.success(`Copied Invite URL`)
          } else {
            world.client.lobbyCreate((response) => {
              if ("error" in response) return

              url = `${hosts[env]}/?join=${response.lobbyId}`
              navigator.clipboard.writeText(url)
              toast.success(`Copied Invite URL`)
            })
          }
        }
      }),
      clickable: Clickable({
        active: true,
        anchor: { x: 0.5, y: 0.5 },
        width: 64,
        height: 48,
        hoverOver: () => {
          portal.components.renderable.setOutline({ color: 0xffff00, thickness: 0.1 })
        },
        hoverOut: () => {
          portal.components.renderable.setOutline({ color: 0xffff00, thickness: 0 })
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        color: tint ?? 0xffffff,
        setContainer: async () => {
          const circle = pixiCircle({ r: 32, style: { color: 0xff00ff } })
          return circle
        }
      })
    }
  })
  return portal
}
