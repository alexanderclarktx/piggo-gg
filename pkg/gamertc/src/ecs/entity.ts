import { Component } from './component';

// an Entity is a collection of components
export abstract class Entity {
  components: Component[] = [];
  name: string;
}
