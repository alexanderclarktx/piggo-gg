import { Component } from "@piggo-legends/core";

// 集 jí (set) - an Entity is a uniquely identified set of Components
export interface Entity {
  id: string,
  components: Record<string, Component<string>>
}
