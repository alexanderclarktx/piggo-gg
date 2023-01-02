import { Health } from '../components/health';
import { Entity } from "../../shared/ecs";
import { Equipment } from '../components/equipment';
import { Tier } from '../components/tier';
import { Traits } from '../components/traits';
import { Name } from '../components/name';

// a Unit can be placed on the board
export class Unit extends Entity {
  health: Health;
  equipment: Equipment;
  traits: Traits;
  tier: Tier;

  constructor (name: Name, health: Health, equipment: Equipment, traits: Traits, tier: Tier) {
    super();
    this.health = health;
    this.equipment = equipment;
    this.traits = traits;
    this.tier = tier;
  }
}
