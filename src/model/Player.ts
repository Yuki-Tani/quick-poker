import { Card } from "./Card";
import { Stack } from "./Stack";

export class Player {
    public stack: Stack = new Stack(0);
    public hand: Card[] = [];

    constructor(
        public readonly playerId: string
    ){
    }
}