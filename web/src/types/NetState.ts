export type NetState = "disconnected" | "offering" | "answering" | "connected";

export const NetStateColor: Record<NetState, string> = {
  "disconnected": "red",
  "offering": "yellow",
  "answering": "orange",
  "connected": "lightgreen"
}
