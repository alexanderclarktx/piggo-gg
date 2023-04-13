import { Entity, EntityProps } from "@piggo-legends/core";
import { Unit } from "./Unit";

export type BenchProps = EntityProps & {
  units: Unit[];
}

export class Bench extends Entity<BenchProps> {
  constructor(props: BenchProps) {
    super(props);
  }
}
