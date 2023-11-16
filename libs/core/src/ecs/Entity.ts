import { Component } from "@piggo-legends/core";

// an Entity is a uniquely identified collection of Components
export interface Entity {
  id: string,
  components: Record<string, Component<string>>
}
