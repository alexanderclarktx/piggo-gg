import { random } from "@piggo-gg/core";

export const genHash = (substr: number = 7) => {
  const id = random().toString(36).substring(substr);
  return id;
}

export const genPlayerId = () => {
  return `noob${Math.trunc((random() * 100))}`;
}
