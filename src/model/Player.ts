import { Card } from "./Card";
import { Pot } from "./Pot";
import { Blind, Stack } from "./Stack";

export class Player {
    public stack: Stack = new Stack(30000);
    public hand: Card[] = [];
    public currentBet: number = 0;
    public isDealer = false;
    public isAction = false;
    public hasAlreadyAction = false;

    constructor(
        public readonly playerId: string,
        public readonly isUnderControl: boolean,
    ){
    }

    public betBlind(blind: Blind): void {
        this.stack = this.stack.add(-blind.amount);
        this.currentBet += blind.amount;
        this.isAction = false;
    }

    public fold(): void {
        this.hand = [];
        this.currentBet = 0;
        this.isAction = false;
        this.hasAlreadyAction = true;
    }

    public bet(amount: number): void {
        const lack = amount - this.currentBet;
        this.stack = this.stack.add(-lack);
        this.currentBet += lack;
        this.isAction = false;
        this.hasAlreadyAction = true;
    }

    public throwCurrentBet(): number {
        const bet = this.currentBet;
        this.currentBet = 0;
        return bet;
    }

    public isDown(): boolean {
        return this.hasAlreadyAction && this.hand.length !== 2;
    }

    public isAllIn(): boolean {
        return this.hasAlreadyAction && this.currentBet > 0 && this.stack.isAllIn();
    }
}