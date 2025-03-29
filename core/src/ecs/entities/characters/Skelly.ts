import {
  Actions, Axe, Character, Collider, Deagle, Debug, DefaultJoystickHandler, dropItem,
  Effects, Element, Health, Input, Inventory, Move, Networked, Player, Pickaxe,
  Point, Position, Renderable, Sword, WASDInputMap, XY, setActiveItemIndex,
  DudeSkin, VolleyCharacterAnimations, VolleyCharacterDynamic, Action
} from "@piggo-gg/core"

export const Skelly = (player: Player, pos?: XY) => Character({
  id: `skelly-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({
      x: pos?.x ?? 32, y: pos?.y ?? 100,
      velocityResets: 1,
      speed: 120,
      gravity: 0.3
    }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 8, mass: 600, hittable: true }),
    health: Health({ hp: 100 }),
    team: player.components.team,
    inventory: Inventory([Axe, Pickaxe, Sword, Deagle]),
    element: Element("flesh"),
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" }),
        "g": () => ({ actionId: "dropItem" }),
        "1": () => ({ actionId: "setActiveItemIndex", params: { index: 0 } }),
        "2": () => ({ actionId: "setActiveItemIndex", params: { index: 1 } }),
        "3": () => ({ actionId: "setActiveItemIndex", params: { index: 2 } }),
        "4": () => ({ actionId: "setActiveItemIndex", params: { index: 3 } }),
        "5": () => ({ actionId: "setActiveItemIndex", params: { index: 4 } })
      },
      joystick: DefaultJoystickHandler
    }),
    actions: Actions({
      move: Move,
      point: Point,
      setActiveItemIndex,
      dropItem,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      })
    }),
    effects: Effects(),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.7 },
      scale: 1.2,
      zIndex: 3,
      interpolate: true,
      scaleMode: "nearest",
      setup: DudeSkin("white"),
      animationSelect: VolleyCharacterAnimations,
      dynamic: VolleyCharacterDynamic
      // setup: async (r) => {
      //   const t = await loadTexture("chars.json")

      //   r.animations = {
      //     d: new AnimatedSprite([t["d1"], t["d2"], t["d3"]]),
      //     u: new AnimatedSprite([t["u1"], t["u2"], t["u3"]]),
      //     l: new AnimatedSprite([t["l1"], t["l2"], t["l3"]]),
      //     r: new AnimatedSprite([t["r1"], t["r2"], t["r3"]]),
      //     dl: new AnimatedSprite([t["dl1"], t["dl2"], t["dl3"]]),
      //     dr: new AnimatedSprite([t["dr1"], t["dr2"], t["dr3"]]),
      //     ul: new AnimatedSprite([t["ul1"], t["ul2"], t["ul3"]]),
      //     ur: new AnimatedSprite([t["ur1"], t["ur2"], t["ur3"]])
      //   }
      // }
    })
  }
})
