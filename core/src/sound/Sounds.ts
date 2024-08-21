import { GunNames } from "@piggo-gg/core";
import { Player } from "tone";

export type Sounds = Record<GunNames, Player>;

const sound: (url: string) => Player = (url) => new Player({ url, volume: -30 }).toDestination();

export const Sounds = (): Sounds => ({
  deagle: sound("pistol.mp3"),
  ak: sound("ak.mp3"),
  awp: sound("aw.mp3"),
})
