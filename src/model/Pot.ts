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
            return new Pot(this.amount, this.activePlayers, this.sidePot.makeNewPot());
        }

        let smallestBet = Number.MAX_VALUE;
        this.activePlayers.forEach(player => {
            if (!player.isDown()) {
                Math.min(smallestBet, player.currentBet);
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
}