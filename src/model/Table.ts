import { actionIds, ActionMessage, JoinTableAction } from "./Action";
import { ActionLog } from "./ActionLog";
import { Dealer } from "./Dealer";
import { Player } from "./Player";
import { User } from "./User";

export class Table {
    public readonly dealer = new Dealer(this.user, this.log);
    public players: Player[] = []

    constructor(
        private readonly user: User,
        private readonly log: ActionLog
    ){
        log.addActionLogResetHandler(this.onActionLogReset.bind(this));
        log.addActionMessageHandlerFor<JoinTableAction>(actionIds.joinTable, this.onAnyoneJoinTable.bind(this));
    }

    private onAnyoneJoinTable(message: ActionMessage<JoinTableAction>): void {
        this.players.push(new Player(message.userId));
    }

    private onActionLogReset(): void {
        this.players = [];
    }
}