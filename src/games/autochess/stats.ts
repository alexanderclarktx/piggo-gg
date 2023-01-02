export type AD = number // attack damage
export type AP = number // ability power
export type AS = number // attack speed
export type CRIT = number // crit chance
export type HP = number // health
export type ARMOR = number // armor
export type MR = number // magic resist
export type MANA = number // mana

// Statline represents the stats of a unit or item
export type Statline = `${AD}-${AP}-${AS}-${CRIT}-${HP}-${ARMOR}-${MR}-${MANA}`
