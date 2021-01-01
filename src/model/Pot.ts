import { CommunityCards } from "./CommunityCards";
import { Hand, WeakestHand } from "./Hand";
import { Player } from "./Player";

export class Pot {

    constructor(
        public readonly amount: number,
        public readonly activePlayers: Player[],
        public readonly sidePot?: Pot,
    ){
    }

    public makeNewPot(): Pot {

        if (this.sidePot) {
            const newActivePlayers = this.activePlayers.filter(player => !player.isDown())
            return new Pot(this.amount, newActivePlayers, this.sidePot.makeNewPot());
        }

        let smallestBet = Number.MAX_VALUE;
        this.activePlayers.forEach(player => {
            if (!player.isDown()) {
                smallestBet = Math.min(smallestBet, player.currentBet);
            }
        });
        let newAmount = this.amount;
        let newActivePlayers: Player[] = [];
        let sidePotPlayers: Player[] = [];
        this.activePlayers.forEach(player => {
            if (player.isDown()) {
                newAmount += player.throwCurrentBet(); 
            } else {
                if (player.currentBet < smallestBet) {
                    throw new Error(`Smallest bet is $${smallestBet}, but ${player.playerId}'s bet is ${player.currentBet}`);
                }
                newAmount += smallestBet;
                player.currentBet -= smallestBet;
                newActivePlayers.push(player);
                if (player.currentBet > 0) {
                    sidePotPlayers.push(player);
                }
            }
        });
        if (sidePotPlayers.length > 0) { // side pot
            return new Pot(newAmount, newActivePlayers, new Pot(0, sidePotPlayers).makeNewPot());
        } else {
            return new Pot(newAmount, newActivePlayers);
        }
    }

    public isBetCompleted(): boolean {
        if (this.sidePot) {
            return this.sidePot.isBetCompleted();
        }
        return this.activePlayers.length === 1;
    }

    public distribute(communityCards: CommunityCards): void {
        this.sidePot?.distribute(communityCards);
        let distributedPlayers: Player[] = [];
        let strongestHand: Hand = new WeakestHand();
        this.activePlayers.forEach(player => {
            const hand = Hand.judgeHand([...communityCards.cards, ...player.hand]);
            if (hand.isStrongerThan(strongestHand)) {
                strongestHand = hand;
                distributedPlayers = [player];
            } else if (!strongestHand.isStrongerThan(hand)) { // draw
                distributedPlayers.push(player);
            }
        });
        distributedPlayers.forEach(player => {
            player.stack = player.stack.add(this.amount / distributedPlayers.length);
        });
    }
}