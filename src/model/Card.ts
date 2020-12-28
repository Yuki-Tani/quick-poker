
export const suits = [
    "Heart",
    "Spade",
    "Club",
    "Diamond"
] as const;
export type Suit = typeof suits[number];

export const ranks = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
] as const;
export type Rank = typeof ranks[number];

export class Card {
    public static readonly kindAmount = suits.length * ranks.length;
    public readonly suit: Suit;
    public readonly rank: Rank;

    constructor(
        public readonly cardId: number
    ){
        this.suit = suits[Math.floor(cardId / ranks.length) % suits.length];
        this.rank = ranks[cardId % ranks.length];
    }
}