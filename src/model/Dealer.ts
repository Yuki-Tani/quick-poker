import { actionIds, ActionMessage, ShuffleDeckAction } from "./Action";
import { ActionLog } from "./ActionLog";
import { CommunityCards } from "./CommunityCards";
import { Deck } from "./Deck";
import { Player } from "./Player";
import { User } from "./User";

export class Dealer {
    private deck = new Deck([]);

    constructor (
        private readonly user: User,
        log: ActionLog,
    ){
        log.addActionMessageHandlerFor<ShuffleDeckAction>(actionIds.shuffleDeck, this.onShuffleDeck.bind(this));
    }

    public shuffleDeck(playerAmount: number): void {
        const usedCardAmount = 5 + playerAmount * 2;
        const newDeck = Deck.createShuffledDeck(usedCardAmount);
        newDeck.shareDeck(this.user);
    }

    public onShuffleDeck(message: ActionMessage<ShuffleDeckAction>): void {
        this.deck = new Deck(message.deck);
    }

    public dealHandCards(players: Player[]): void {
        console.log("Dealer : deal hands");
        players.forEach(player => {
            const firstCard = this.deck.draw();
            const secondCard = this.deck.draw();
            if (firstCard && secondCard) {
                player.hand = [firstCard, secondCard];
            } else {
                throw new Error("Cannot deal cards. Deck has been already empty.");
            }
        });
    }

    public openCardsFor(communityCards: CommunityCards): void {
        const round = communityCards.getRound();
        const amount = 
            round === "preflop" ? 3 :
            round === "flop" ? 1 :
            round === "turn" ? 1 : 0;

        for(let i=0; i<amount; i++) {
            const newCard = this.deck.draw();
            if (newCard) {
                communityCards.cards.push(newCard);
            } else {
                throw new Error("Cannot open cards. Deck has been already empty.");
            }
        }
    }
}