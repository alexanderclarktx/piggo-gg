import { Actions, Clickable, Collider, Debug, Entity, Position, Renderable, XY, loadTexture } from "@piggo-gg/core"
import { Sprite } from "pixi.js"
import toast from "react-hot-toast"

export type InviteStoneProps = {
  pos: XY
  tint?: number
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
        click: {
          invoke: ({ world }) => {
            if (!world.client) return

            let url = ""
            if (world.client.lobbyId) {
              url = `https://piggo.gg/?join=${world.client.lobbyId}`
              navigator.clipboard.writeText(url)
              toast.success(`Copied Invite URL`)
            } else {
              world.client.createLobby((response) => {
                url = `https://piggo.gg/?join=${response.lobbyId}`
                navigator.clipboard.writeText(url)
                toast.success(`Copied Invite URL`)
              })
            }
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
          const textures = await loadTexture("dungeon-objects.json")
          const sprite = new Sprite({ texture: textures["invite-stone"] })
          sprite.anchor.set(0.5, 0.5)
          return sprite
        }
      })
    }
  })
  return portal
}
