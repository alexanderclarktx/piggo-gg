import {
  Actions, Character, Collider, Debug, DefaultJoystickHandler, dropItem,
  Effects, Element, Health, Input, Inventory, Move, Networked, Player, Pickaxe,
  Point, Position, Renderable, WASDInputMap, XY, setActiveItemIndex, DudeSkin,
  VolleyCharacterAnimations, VolleyCharacterDynamic, Action
} from "@piggo-gg/core"

export const Skelly = (player: Player, pos?: XY) => Character({
  id: `skelly-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({
      x: pos?.x ?? 0, y: pos?.y ?? 150, z: 50,
      velocityResets: 1,
      speed: 125,
      gravity: 0.3
    }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4, hittable: true }),
    health: Health({ hp: 100 }),
    team: player.components.team,
    inventory: Inventory([Pickaxe]),
    element: Element("flesh"),
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" }),
        "r": () => ({ actionId: "jetpack" }),
        "g": () => ({ actionId: "dropItem" }),
        "1": () => ({ actionId: "setActiveItemIndex", params: { index: 0 } }),
        "2": () => ({ actionId: "setActiveItemIndex", params: { index: 1 } }),
        "3": () => ({ actionId: "setActiveItemIndex", params: { index: 2 } }),
        "4": () => ({ actionId: "setActiveItemIndex", params: { index: 3 } }),
        "5": () => ({ actionId: "setActiveItemIndex", params: { index: 4 } }),
        "q": ({ hold }) => {
          if (hold) return null
          return { actionId: "changeAngle" }
        }
      },
      joystick: DefaultJoystickHandler
    }),
    actions: Actions({
      move: Move,
      point: Point,
      setActiveItemIndex,
      dropItem,
      jetpack: Action("jetpack", ({ entity }) => {
        entity?.components?.position?.setVelocity({ z: 3 }) // todo use impulse
      }),
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 5 })
      }),
      changeAngle: Action("changeAngle", ({ world }) => {
        if (!world.renderer) return
        world.renderer.camera.angle += 2
        if (world.renderer.camera.angle >= 4) world.renderer.camera.angle = 0
      })
    }),
    effects: Effects(),
    renderable: Renderable({
      anchor: { x: 0.55, y: 0.9 },
      scale: 1.2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      setup: DudeSkin("white"),
      animationSelect: VolleyCharacterAnimations,
      onTick: VolleyCharacterDynamic
    })
  }
})
