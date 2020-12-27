import { Action, actionIds, ActionMessage, ExitTableAction, isMessageOf, JoinTableAction } from "./Action";
import { ActionLog } from "./ActionLog";
import { Connection } from "./Connection";

export class User {
    constructor(
        public readonly id = "",
        private readonly connection: Connection,
    ){
    }

    public isDefaultUser() {
        return this.id === "";
    }

    public isTableHost(actionLog: ActionLog): boolean {
        const exitList = new Set<string>();
        let host = "";
        for(let i = actionLog.messages.length - 1; i >= 0; i--) {
            const message = actionLog.messages[i];
            if (isMessageOf<ExitTableAction>(actionIds.exitTable, message)) {
                exitList.add(message.userId);
            } else if (isMessageOf<JoinTableAction>(actionIds.joinTable, message)) {
                if (exitList.has(message.userId)) {
                    exitList.delete(message.userId);
                } else {
                    host = message.userId;
                }
            }
        }
        return host === this.id;
    }

    public doAction(action: Action): void {
        if (this.isDefaultUser()) {
            console.warn("user id is not prepared.");
            return;
        }
        const message: ActionMessage<Action> = { userId: this.id, ...action };
        const messageText = JSON.stringify(message);
        this.connection.sendMessageAsync(messageText)
            .then(() => console.log(`succeeded in sending message ${message.actionId}`))
            .catch((reason) => window.alert(`failed to send your action: ${message.actionId}`));
    }

    public isMessageMine(message: ActionMessage<Action>) {
        return message.userId === this.id;
    }
}