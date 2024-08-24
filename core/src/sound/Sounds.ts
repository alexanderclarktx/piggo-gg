import { GunNames } from "@piggo-gg/core";
import { Player } from "tone";

export type Sound = Player;

type WallPlaceSounds = "wallPlace1" | "wallPlace2";
type ZombieDeathSounds = "zombieDeath1" | "zombieDeath2" | "zombieDeath3" | "zombieDeath4";

export type ValidSounds = GunNames | ZombieDeathSounds | WallPlaceSounds;
export type Sounds = Record<ValidSounds, Sound>;

const load = (url: string, volume: number): Sound => {
  const player = new Player({ url, volume })
  return player.toDestination();
}

export const Sounds = (): Sounds => ({
  deagle: load("pistol.mp3", -30),
  ak: load("ak.mp3", -25),
  awp: load("awp.mp3", -30),
  zombieDeath1: load("zombieDeath1.wav", -25),
  zombieDeath2: load("zombieDeath2.wav", -25),
  zombieDeath3: load("zombieDeath3.wav", -25),
  zombieDeath4: load("zombieDeath4.wav", -25),
  wallPlace1: load("wallPlace1.wav", -15),
  wallPlace2: load("wallPlace2.wav", -15),
})
