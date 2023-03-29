import { Component } from './Component';

// an Entity is a collection of components
export class Entity {
  components: Component[] = [];
  name: string;

  constructor({ name, components }: { name: string; components: Component[]; }) {
    this.name = name;
    this.components = components;
  }
}
