
export const actionIds = {
    joinTable: "Join-Table",
    exitTable: "Exit-Table",
    shareActionLog: "Share-Action-Log",
    addStack: "Add-Stack",
    shuffleDeck: "Shuffle-Deck",
    fold: "Fold",
    call: "Call",
    bet: "Bet",
} as const;

export type ActionId = typeof actionIds[keyof typeof actionIds];

export type Action = { actionId: ActionId } & (
    JoinTableAction |
    ExitTableAction |
    ShareActionLogAction |
    AddStackAction |
    ShuffleDeckAction |
    FoldAction |
    CallAction |
    BetAction
);

export interface JoinTableAction {
    actionId: typeof actionIds.joinTable;
}

export interface ExitTableAction {
    actionId: typeof actionIds.exitTable;
}

export interface ShareActionLogAction {
    actionId: typeof actionIds.shareActionLog;
    sharingUserId: string;
    actionLog: ActionMessage<Action>[];
}

export interface AddStackAction {
    actionId: typeof actionIds.addStack;
    additionalStack: number;
    currentStack: number;
}

export interface ShuffleDeckAction {
    actionId: typeof actionIds.shuffleDeck;
    deck: number[];
}

export interface FoldAction {
    actionId: typeof actionIds.fold;
}

export interface CallAction {
    actionId: typeof actionIds.call
}

export interface BetAction {
    actionId: typeof actionIds.bet;
    amount: number;
}

export type ActionMessage<SpecificAction extends Action> = { userId: string } & Action & SpecificAction;
export type ActionMessageHandler<SpecificAction extends Action> = (message: ActionMessage<SpecificAction>) => void;

export function isMessageOf<SpecificAction extends Action>(id: ActionId, message: ActionMessage<Action>): message is ActionMessage<SpecificAction> {
    return message.actionId === id;
}