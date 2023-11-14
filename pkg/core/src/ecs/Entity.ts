import { Component } from "@piggo-legends/core";

export interface Entity {
  id: string,
  components: Record<string, Component<string>>
}
