import { Health } from '../components/health';
import { Entity } from "@piggo-legends/ecstacy";
import { Experience } from "../components/experience";
import { Gold } from "../components/gold";

export class Player extends Entity {
  gold: Gold;
  experience: Experience;
  health: Health;

  constructor(gold: Gold = new Gold(0), experience: Experience = new Experience(0, 1), health: Health = new Health(100, 100)) {
    super();
    this.gold = gold;
    this.experience = experience;
    this.health = health;
  }
}
