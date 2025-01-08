import { Actions, Collider, Debug, Entity, Networked, Position, Renderable, XY, loadTexture, pixiText } from "@piggo-gg/core"
import { Matrix, Sprite } from "pixi.js"

export type PortalProps = {
  pos: XY
  game: string
  tint?: number
}

export const Portal = ({ pos, game, tint }: PortalProps): Entity => {
  const portal = Entity<Renderable>({
    id: `portal-${game}`,
    components: {
      position: Position(pos),
      networked: Networked({ isNetworked: true }),
      collider: Collider({
        shape: "ball", radius: 32,
        sensor: (e2, world) => {
          if (e2.id.startsWith("skelly")) {
            // todo actionBuffer push should be handled by PhysicsSystem
            world.actionBuffer.push(world.tick + 1, portal.id, { playerId: world.client?.playerId(), actionId: "teleport", params: { game } })
            return true
          }
          return false
        }
      }),
      actions: Actions<{ game: string }>({
        teleport: ({ world, params }) => world.setGame(params.game)
      }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 1,
        color: tint ?? 0xffffff,
        anchor: { x: 0.5, y: 0.5 },
        setup: async (r) => {
          const textures = await loadTexture("portal.json")
          const sprite = new Sprite({ texture: textures["portal"] })
          sprite.setFromMatrix(new Matrix(2, 0, 0, 1, 0, 0))

          sprite.anchor.set(0.5, 0.5)

          const text = pixiText({
            text: game,
            anchor: { x: 0.5, y: 0.5 },
            style: { fill: 0xffffff, fontSize: 14 }
          })
          sprite.addChild(text)

          r.c.addChild(sprite)
        }
      })
    }
  })
  return portal
}
