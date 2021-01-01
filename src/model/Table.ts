import { Action, actionIds, ActionMessage, BetAction, CallAction, FoldAction, JoinTableAction, ShuffleDeckAction } from "./Action";
import { ActionLog } from "./ActionLog";
import { CommunityCards } from "./CommunityCards";
import { Dealer } from "./Dealer";
import { Player } from "./Player";
import { Pot } from "./Pot";
import { Blind } from "./Stack";
import { User } from "./User";

export class Table {
    public readonly dealer: Dealer;
    public players: Player[] = [];
    public waiters: Player[] = [];
    public dealerButtonPosition = 0;
    public currentAction = 0;
    public currentBlind = new Blind(100);
    public currentCall = this.currentBlind.amount;
    public currentMinRaise = this.currentBlind.amount;
    public communityCards = new CommunityCards();
    public pot = new Pot(0, []);

    constructor(
        private readonly user: User,
        private readonly log: ActionLog,
        private readonly onTableUpdate: () => void,
    ){
        // initialize order is important
        this.dealer = new Dealer(this.user, this.log);
        log.addActionLogResetHandler(this.onActionLogReset.bind(this));
        log.addActionMessageHandlerFor<JoinTableAction>(actionIds.joinTable, this.onAnyoneJoinTable.bind(this));
        log.addActionMessageHandlerFor<ShuffleDeckAction>(actionIds.shuffleDeck, this.onShuffleDeck.bind(this));
        log.addActionMessageHandlerFor<FoldAction>(actionIds.fold, this.onFold.bind(this));
        log.addActionMessageHandlerFor<CallAction>(actionIds.call, this.onCall.bind(this));
        log.addActionMessageHandlerFor<BetAction>(actionIds.bet, this.onBet.bind(this));
    }

    private onAnyoneJoinTable(message: ActionMessage<JoinTableAction>): void {
        this.waiters.push(new Player(message.userId, this.user.isMessageMine(message)));
        if (this.isMembersGathered()) {
            this.joinWaiters();
            if (this.user.isTableHost(this.log)) {
                this.dealer.shuffleDeck(this.players.length);
            }
        }
    }

    private onActionLogReset(): void {
        this.players = [];
        this.waiters = [];
        this.dealerButtonPosition = 0;
        this.currentAction = 0;
    }

    private onShuffleDeck(): void {
        this.pot = new Pot(0, this.players);
        // blind
        const sb = this.players[this.getIndexOf("SB")];
        console.log(`${sb.playerId} is betting a small blind.`);
        sb.betBlind(this.currentBlind.getSmallBlind());
        const bb = this.players[this.getIndexOf("BB")];
        console.log(`${bb.playerId} is betting a big blind.`);
        bb.betBlind(this.currentBlind);
        this.currentCall = this.currentBlind.amount;
        this.currentMinRaise = this.currentBlind.amount;
        // deal
        this.dealer.dealHandCards(this.players);
        this.resetActivePlayersActionStatus();
        this.currentAction = this.getIndexOf("UTG");
        this.players[this.currentAction].isAction = true;
        this.onTableUpdate();
    }

    private onFold(message: ActionMessage<FoldAction>): void {
        this.checkCurrentActionPlayer(message).fold();
        const nextPlayer = this.goNextAction();
        if (nextPlayer === "allActionCompleted") {
            this.pot = this.pot.makeNewPot();
            if (this.communityCards.isAllCardsOpen() || this.pot.isBetCompleted()) {
                this.completeRounds();
            } else {
                this.goNextRound();
            } 
        } else if (this.checkWinner() !== "NotDecided") { // All fold, BB winner
            this.pot = this.pot.makeNewPot();
            this.completeRounds();
        }
        this.onTableUpdate();
    }

    private onCall(message: ActionMessage<CallAction>): void { // call or check
        this.checkCurrentActionPlayer(message).bet(this.currentCall);
        const nextPlayer = this.goNextAction();
        if (nextPlayer === "allActionCompleted") {
            this.pot = this.pot.makeNewPot();
            if (this.communityCards.isAllCardsOpen()) {
                this.completeRounds();
            } else {
                this.goNextRound();
            }
        }
        this.onTableUpdate();
    }

    private onBet(message: ActionMessage<BetAction>): void {
        if (message.amount < this.currentCall + this.currentMinRaise) {
            return;
        }
        this.resetActivePlayersActionStatus();
        this.checkCurrentActionPlayer(message).bet(message.amount);
        this.currentMinRaise = message.amount - this.currentCall;
        this.currentCall = message.amount;
        this.goNextAction();
        this.onTableUpdate();
    }

    private isMembersGathered(): boolean {
        return this.players.length === 0 && this.waiters.length >= 2;
    }

    private joinWaiters(): void {
        this.players.push(...this.waiters);
        this.waiters = [];
    }

    private resetActivePlayersActionStatus(): void {
        this.players.forEach(player => {
            if (!player.isDown()) {
                player.hasAlreadyAction = false;
            }
        });
    }

    private goNextAction(): Player | "allActionCompleted" {
        this.players[this.currentAction].isAction = false;
        for (let i = 1; i < this.players.length; i++) {
            const targetIndex = (this.currentAction + i) % this.players.length;
            if (!this.players[targetIndex].hasAlreadyAction) {
                this.currentAction = targetIndex
                this.players[targetIndex].isAction = true;
                return this.players[targetIndex];
            }
        }        
        return "allActionCompleted";
    }

    private goNextRound(): void {
        // open
        this.dealer.openCardsFor(this.communityCards);
        this.resetActivePlayersActionStatus();
        this.currentAction = this.getIndexOf("BTN");
        this.currentCall = 0;
        this.currentMinRaise = this.currentBlind.amount;
        this.goNextAction();
        this.onTableUpdate();
    }

    private completeRounds(): void {
        // result
        this.pot.distribute(this.communityCards);
        this.pot = new Pot(0, []);
        // next game
        this.communityCards.throwAway();
        this.joinWaiters();
        this.moveDealerButton();
        if (this.user.isTableHost(this.log)) {
            this.dealer.shuffleDeck(this.players.length);
        }
    }

    private moveDealerButton(): Player {
        this.players[this.dealerButtonPosition].isDealer = false;
        this.dealerButtonPosition = (this.dealerButtonPosition + 1) % this.players.length;
        this.players[this.dealerButtonPosition].isDealer = true;
        return this.players[this.dealerButtonPosition];
    }

    private getIndexOf(position: "BTN" | "SB" | "BB" | "UTG"): number {
        const relative = 
            position === "BTN" ? 0 :
            position === "SB" ? 1 :
            position === "BB" ? 2 :
            position === "UTG" ? 3 :
            0;
        return (this.dealerButtonPosition + relative) % this.players.length; 
    }

    private checkCurrentActionPlayer(message: ActionMessage<Action>): Player {
        const player = this.players[this.currentAction];
        if (message.userId !== player.playerId) {
            throw new Error(`Current action is ${player.playerId}, but the action message is sent from ${message.userId}.`);
        }
        return player;
    }

    private checkWinner(): Player | "NotDecided" {
        let winner: Player | undefined;
        this.players.forEach(player => {
            if (!player.isDown()) {
                if (winner) {
                    return "NotDecided";
                } else {
                    winner = player;
                }
            }
        });
        return winner ?? "NotDecided";
    }
}