import { Card } from "./Card";
import { Blind, Stack } from "./Stack";

export class Player {
    public stack: Stack = new Stack(30000);
    public hand: Card[] = [];
    public currentBet: number = 0;

    constructor(
        public readonly playerId: string
    ){
    }

    public betBlind(blind: Blind): void {
        this.stack = this.stack.addStack(-blind.amount);
        this.currentBet += blind.amount;
    }
}