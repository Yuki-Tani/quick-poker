import { Action, actionIds, ActionMessage, BetAction, CallAction, FoldAction, JoinTableAction, ShuffleDeckAction } from "./Action";
import { ActionLog } from "./ActionLog";
import { Dealer } from "./Dealer";
import { Player } from "./Player";
import { Blind } from "./Stack";
import { User } from "./User";

export class Table {
    public readonly dealer;
    public players: Player[] = [];
    public waiters: Player[] = [];
    public dealerButtonPosition = 0;
    public currentAction = 0;
    public currentBlind = new Blind(100);
    public currentCall = this.currentBlind.amount;

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
        this.moveDealerButton();
        // blind
        const sb = this.players[this.getIndexOf("SB")];
        console.log(`${sb.playerId} is betting a small blind.`);
        sb.betBlind(this.currentBlind.getSmallBlind());
        const bb = this.players[this.getIndexOf("BB")];
        console.log(`${bb.playerId} is betting a big blind.`);
        bb.betBlind(this.currentBlind);
        this.currentCall = this.currentBlind.amount;
        // deal
        this.dealer.dealHandCards(this.players);
        this.resetActivePlayersActionStatus();
        this.currentAction = this.getIndexOf("UG");
        this.players[this.currentAction].isAction = true;
        this.onTableUpdate();
    }

    private onFold(message: ActionMessage<FoldAction>): void {
        this.checkCurrentActionPlayer(message).fold();
        const nextPlayer = this.goNextAction();
        if (nextPlayer === "allActionCompleted") {
            // TODO: win check
            // TODO: next stage
        } else if (this.checkWinner() !== "NotDecided") { // All fold, BB winner
            // TODO: winner
        }
        this.onTableUpdate();
    }

    private onCall(message: ActionMessage<CallAction>): void { // call or check
        this.checkCurrentActionPlayer(message).bet(this.currentCall);
        const nextPlayer = this.goNextAction();
        if (nextPlayer === "allActionCompleted") {
            // TODO: next stage
        }
        this.onTableUpdate();
    }

    private onBet(message: ActionMessage<BetAction>): void {
        if (message.amount < this.currentCall) {
            return;
        }
        this.resetActivePlayersActionStatus();
        this.checkCurrentActionPlayer(message).bet(message.amount);
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

    private moveDealerButton(): Player {
        this.players[this.dealerButtonPosition].isDealer = false;
        this.dealerButtonPosition = (this.dealerButtonPosition + 1) % this.players.length;
        this.players[this.dealerButtonPosition].isDealer = true;
        return this.players[this.dealerButtonPosition];
    }

    private getIndexOf(position: "DB" | "SB" | "BB" | "UG"): number {
        const relative = 
            position === "DB" ? 0 :
            position === "SB" ? 1 :
            position === "BB" ? 2 :
            position === "UG" ? 3 :
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