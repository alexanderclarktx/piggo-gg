import { Actions, Component, Effects, Entity, Input, Item, Name, Reload, Shoot, SpawnBullet, World, randomInt } from "@piggo-gg/core";

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

export const GunItem = (name: string, gun: () => Gun): Item => Entity({
  id: name,
  components: {
    name: Name(name),
    input: Input({
      press: {
        "r": ({ character, mouse }) => ({ action: "reload", params: { character, mouse } }),
        "mb1": ({ character, mouse }) => ({ action: "shoot", params: { character, mouse } })
      }
    }),
    actions: Actions<any>({
      "spawnBullet": SpawnBullet,
      "shoot": Shoot,
      "reload": Reload
    }),
    gun: gun(),
    effects: Effects()
  }
})

export const Deagle = () => GunItem("deagle", WeaponTable["deagle"]);
export const AK = () => GunItem("ak", WeaponTable["ak"]);
export const AWP = () => GunItem("awp", WeaponTable["awp"]);
