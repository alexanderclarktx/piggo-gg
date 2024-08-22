import { GunNames } from "@piggo-gg/core";
import { Player } from "tone";

type ZombieDeathSounds = "zombieDeath1" | "zombieDeath2" | "zombieDeath3" | "zombieDeath4";

export type Sounds = Record<GunNames | ZombieDeathSounds, Player>;

const sound = (url: string, volume: number): Player => {
  const player = new Player({ url, volume })
  return player.toDestination();
}

export const Sounds: Sounds = {
  deagle: sound("pistol.mp3", -40),
  ak: sound("ak.mp3", -30),
  awp: sound("awp.mp3", -40),
  zombieDeath1: sound("zombieDeath1.wav", -30),
  zombieDeath2: sound("zombieDeath2.wav", -30),
  zombieDeath3: sound("zombieDeath3.wav", -30),
  zombieDeath4: sound("zombieDeath4.wav", -30)
}
