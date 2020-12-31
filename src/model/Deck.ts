import { actionIds } from "./Action";
import { Card } from "./Card";
import { User } from "./User";

export class Deck {

    public static createShuffledDeck(amount: number) {
        const usedDeckAmount = Math.ceil(amount / Card.kindAmount);
        const newDeck = Array.from(Array(usedDeckAmount * Card.kindAmount).keys());
        for (var i = newDeck.length - 1; i >= 0; i--) {
            const target = Math.floor(Math.random() * (i + 1));
            [newDeck[target], newDeck[i]] = [newDeck[i], newDeck[target]];
        }
        return new Deck(newDeck.slice(0, amount))
    }

    constructor (
        private readonly cardIds: number[]
    ) {
    }

    public draw(): Card | undefined {
        const cardId = this.cardIds.shift();
        return cardId ? new Card(cardId) : undefined;
    }

    public shareDeck(user: User): void {
        user.doAction({
            actionId: actionIds.shuffleDeck,
            deck: this.cardIds
        })
    }
}