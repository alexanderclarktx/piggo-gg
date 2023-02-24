// // import { Player } from "../shared/entity";

// interface Game {
//     onTick: (tick: number) => void;
//     render: () => void;
// };

// type DevelopmentCard = {
//     name: string;
//     description: string;
//     effect: () => void;
// };

// type ResourceCard = {
//     type: "wood" | "brick" | "sheep" | "wheat" | "ore";
// }

// const knight: DevelopmentCard = {
//     name: "Knight",
//     description: "Move the robber",
//     effect: () => {}
// }

// const roadBuilding: DevelopmentCard = {
//     name: "Road Building",
//     description: "Build two roads",
//     effect: () => {}
// }

// const yearOfPlenty: DevelopmentCard = {
//     name: "Year of Plenty",
//     description: "Take two resources",
//     effect: () => {}
// }

// const monopoly: DevelopmentCard = {
//     name: "Monopoly",
//     description: "Take all resources of one type",
//     effect: () => {}
// }

// const victoryPoint: DevelopmentCard = {
//     name: "Victory Point",
//     description: "Get a victory point",
//     effect: () => {}
// }

// // 25 development cards: 14 knights, 5 victory points, 2 road building, 2 year of plenty, 2 monopoly
// const developmentCards: DevelopmentCard[] = [
//     knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight,
//     victoryPoint, victoryPoint, victoryPoint, victoryPoint, victoryPoint,
//     roadBuilding, roadBuilding,
//     yearOfPlenty, yearOfPlenty,
//     monopoly, monopoly
// ].sort(() => Math.random() - 0.5);

// interface Owned {
//     owner: Player;
// }

// interface Building {
//     location: [number, number];
// }

// class Road implements Owned, Building {
//     owner: Player;
//     location: [number, number];
// }

// class Settlement implements Owned, Building {
//     owner: Player;
//     location: [number, number];
// }
// class City implements Owned, Building {
//     owner: Player;
//     location: [number, number]; // TODO
// }

// type Tile = {
//     resource: "wood" | "brick" | "sheep" | "wheat" | "ore" | "desert";
// }

// type Edge = {
//     location: [number, number]; // TODO
// }

// type Board = {
//     tiles: Tile[][]; // 19 tiles
// }

// class CatanPlayer implements Player {
//     name: string;
//     private points: number = 0;
//     private resourceCards: ResourceCard[] = [];
//     private developmentCards: DevelopmentCard[] = [];
//     private buildings: Building[] = [];
// }

// type CatanState = {
//     tick: number;
//     players: Player[];
//     buildings: Building[];
//     board: Board;
//     edges: Edge[];
//     tiles: Tile[];
// };

// class Catan implements Game {
//     private tick: number = 0;
//     // private players: Player[] = [];
//     // private state: CatanState;

//     public onTick(tick: number): void {
//         this.tick = tick;
//     }

//     public render(): void {
//         console.log(this.tick);
//     }
// }
// // module.exports = {Catan}

// // const game = new Catan();
// // game.onTick(1);
// // game.render();
