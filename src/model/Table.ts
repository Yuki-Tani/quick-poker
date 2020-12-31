import { actionIds, ActionMessage, JoinTableAction, ShuffleDeckAction } from "./Action";
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
    }

    private onAnyoneJoinTable(message: ActionMessage<JoinTableAction>): void {
        this.waiters.push(new Player(message.userId));
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
        this.currentAction = this.dealerButtonPosition;
        // blind
        const sb = this.goNextAction();
        console.log(`${sb.playerId} is betting a small blind.`);
        sb.betBlind(this.currentBlind.getSmallBlind());
        const bb = this.goNextAction();
        console.log(`${bb.playerId} is betting a big blind.`);
        bb.betBlind(this.currentBlind);
        // deal
        this.dealer.dealHandCards(this.players);
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

    private goNextAction(): Player {
        this.currentAction = (this.currentAction + 1) % this.players.length;
        return this.players[this.currentAction];
    }
}