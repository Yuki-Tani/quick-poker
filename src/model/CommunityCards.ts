import { Card } from "./Card";

export const rounds = ["preflop", "flop", "turn", "river"] as const;
export type Round = typeof rounds[number]

export class CommunityCards {
    public cards: Card[] = [];

    public throwAway(): void {
        this.cards = [];
    }

    public getRound(): Round {
        switch(this.cards.length) {
            case 0: return "preflop";
            case 3: return "flop";
            case 4: return "turn";
            case 5: return "river";
            default: throw new Error(`there is invalid ${this.cards.length} community cards.`)
        }
    }
}