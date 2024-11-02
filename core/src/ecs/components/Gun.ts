import {
  Actions, Component, Item, Effects, Entity, ItemBuilder, Reload, Renderable,
  Shoot, SpawnHitbox, World, abs, hypot, loadTexture, min, randomInt,
  Clickable
} from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type GunNames = "deagle" | "ak" | "awp";

export type Gun = Component<"gun", { id: number, clip: number, ammo: number }> & {
  automatic: boolean
  bulletSize: number
  clipSize: number
  damage: number
  fireRate: number
  lastShot: number
  outlineColor: number
  name: GunNames
  reloading: boolean
  reloadTime: number
  speed: number
  canShoot: (world: World, tick: number, hold: boolean) => boolean
  didShoot: (world: World) => void
}

export type GunProps = {
  automatic: boolean
  ammo: number
  bulletSize: number
  clipSize: number
  damage: number
  fireRate: number
  name: GunNames
  reloadTime: number
  speed: number
}

const GunBuilder = (props: GunProps) => () => Gun(props)

export const Gun = (props: GunProps): Gun => {

  const gun: Gun = {
    type: "gun",
    data: {
      id: randomInt(100000),
      clip: props.clipSize,
      ammo: props.ammo
    },
    automatic: props.automatic,
    bulletSize: props.bulletSize,
    clipSize: props.clipSize,
    damage: props.damage,
    fireRate: props.fireRate,
    lastShot: 0,
    outlineColor: 0x000000,
    name: props.name,
    reloading: false,
    reloadTime: props.reloadTime,
    speed: props.speed,
    canShoot: (world: World, tick: number, hold: boolean) => {

      if (hold) {
        // only hold automatic
        if (!props.automatic) return false;

        // firing rate
        if ((gun.lastShot + gun.fireRate) > world.tick) return false;
      }

      // auto/semi
      if (!props.automatic && gun.lastShot >= tick) return false;

      // has clip
      if (gun.data.clip <= 0) return false;

      // if it's reloading
      if (gun.reloading) return false;

      return true;
    },
    didShoot: (world: World) => {
      gun.lastShot = world.tick;
      gun.data.clip -= 1;
    }
  }
  return gun;
}

const DeagleBuilder = GunBuilder({
  name: "deagle",
  automatic: false,
  ammo: 60,
  clipSize: 15,
  damage: 15,
  fireRate: 3,
  reloadTime: 40,
  bulletSize: 4,
  speed: 400
});

const AKBuilder = GunBuilder({
  name: "ak",
  automatic: true,
  ammo: 90,
  clipSize: 30,
  damage: 25,
  fireRate: 10,
  reloadTime: 50,
  bulletSize: 4,
  speed: 500
});

const AWPBuilder = GunBuilder({
  name: "awp",
  automatic: false,
  ammo: 20,
  clipSize: 1,
  damage: 200,
  fireRate: 40,
  reloadTime: 40,
  bulletSize: 5,
  speed: 600
});

export const WeaponTable: Record<GunNames, () => Gun> = {
  "deagle": DeagleBuilder,
  "ak": AKBuilder,
  "awp": AWPBuilder
}

export const GunItem = (name: string, gun: () => Gun): ItemBuilder => (character) => Entity({
  id: name,
  components: {
    position: character.components.position,
    actions: Actions({
      spawnHitbox: SpawnHitbox,
      mb1: Shoot,
      reload: Reload
    }),
    gun: gun(),
    effects: Effects(),
    item: Item({ name }),
    clickable: Clickable({ width: 0, height: 0, active: false }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 2,
      scale: 2,
      anchor: { x: 0.5, y: 0.5 },
      position: { x: 20, y: 0 },
      interpolate: true,
      visible: false,
      outline: { color: 0x000000, thickness: 1 },
      dynamic: (_, r) => {
        const { pointing, pointingDelta } = character.components.position.data

        const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

        const hyp_x = pointingDelta.x / hypotenuse
        const hyp_y = pointingDelta.y / hypotenuse

        r.position = {
          x: hyp_x * min(20, abs(pointingDelta.x)),
          y: hyp_y * min(20, abs(pointingDelta.y)) - 5
        }

        r.zIndex = (pointingDelta.y > 0) ? 3 : 2

        r.bufferedAnimation = pointing.toString()
      },
      setup: async (r: Renderable) => {
        const textures = await loadTexture(`${name}.json`)

        r.animations = {
          "0": new AnimatedSprite([textures["0"]]),
          "1": new AnimatedSprite([textures["1"]]),
          "2": new AnimatedSprite([textures["2"]]),
          "3": new AnimatedSprite([textures["3"]]),
          "4": new AnimatedSprite([textures["4"]]),
          "5": new AnimatedSprite([textures["5"]]),
          "6": new AnimatedSprite([textures["6"]]),
          "7": new AnimatedSprite([textures["7"]]),
        }
      }
    })
  }
})

export const Deagle = GunItem("deagle", WeaponTable["deagle"]);
export const AK = GunItem("ak", WeaponTable["ak"]);
export const AWP = GunItem("awp", WeaponTable["awp"]);
