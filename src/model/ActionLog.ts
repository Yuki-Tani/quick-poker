import { Action, ActionId, actionIds, ActionMessage, ActionMessageHandler, isMessageOf, JoinTableAction, ShareActionLogAction } from "./Action";
import { RecieveMessageEventListener } from "./Connection";
import { User } from "./User";

export class ActionLog implements RecieveMessageEventListener {
    private readonly actionMessageHandlers: Set<ActionMessageHandler<Action>>;
    private log: ActionMessage<Action>[];

    get messages(): ActionMessage<Action>[] {
        return this.log;
    }

    constructor(
        private readonly user: User
    ){
        this.log = [];
        this.actionMessageHandlers = new Set();
        this.addActionMessageHandlerFor<ShareActionLogAction>(actionIds.shareActionLog, this.onAnyoneShareActionLog.bind(this));
        this.addActionMessageHandlerFor<JoinTableAction>(actionIds.joinTable, this.onAnyoneJoinTable.bind(this));
    }

    public onRecieveMessage(message: ActionMessage<Action>): void {
        this.messages.push(message);
        console.log(`${message.userId} : ${message.actionId}`);
        this.actionMessageHandlers.forEach(handler => {
            handler(message);
        });
    }

    public addActionMessageHandlerFor<SpecificAction extends Action>(actionId: ActionId, handler: ActionMessageHandler<SpecificAction>) {
        this.actionMessageHandlers.add(this.filterActionMessageHandlerFor<SpecificAction>(actionId, handler));
    }

    public removeActionMessageHandlerFor<SpecificAction extends Action>(actionId: ActionId, handler: ActionMessageHandler<SpecificAction>) {
        this.actionMessageHandlers.delete(this.filterActionMessageHandlerFor<SpecificAction>(actionId, handler));
    }

    private filterActionMessageHandlerFor<SpecificAction extends Action>(actionId: ActionId, handler: ActionMessageHandler<SpecificAction>) {
        return (message: ActionMessage<Action>) => {
            if (isMessageOf<SpecificAction>(actionId, message)) {
                handler(message);
            }
        };
    }

    private onAnyoneShareActionLog(message: ActionMessage<ShareActionLogAction>): void {
        if (message.sharingUserId === this.user.id) {
            this.log = message.actionLog;
            console.log(`Log is shared by ${message.userId}`);
        }
    }

    private onAnyoneJoinTable(message: ActionMessage<JoinTableAction>): void {
        if (!this.user.isMessageMine(message) && this.user.isTableHost(this)) {
            this.user.doAction({
                actionId: actionIds.shareActionLog,
                sharingUserId: message.userId,
                actionLog: this.log,
            });
        }
    }
}