import React, { ReactNode } from "react";
import { actionIds } from "../model/Action";
import { ActionLog } from "../model/ActionLog";
import { Connection } from "../model/Connection";
import { PageId, TranslatePage } from "../model/Page";
import { Player } from "../model/Player";
import { Table } from "../model/Table";
import { User } from "../model/User";
import { PlayerView } from "./PlayerView";

export type TableViewProps = {
    connection: Connection;
    user: User;
    translate: TranslatePage;
}

export type TableViewStates = {
    input: string,
    players: Player[],
}

export class TableView extends React.Component<TableViewProps, TableViewStates> {
    private actionLog: ActionLog;
    private table: Table;

    constructor(props: TableViewProps) {
        super(props);
        this.state = { input: "", players: [] };
        this.actionLog = new ActionLog(this.props.user, this.updateTableView.bind(this));
        this.table = new Table(this.props.user, this.actionLog, this.updateTableView.bind(this));
    }

    public componentDidMount(): void {
        this.props.connection.connectAsync()
            .then(() => this.onConnectSuccess())
            .catch(() => this.onConnectFail())
    }

    public componentWillUnmount(): void {
        this.props.connection.RemoveRecieveListener(this.actionLog);
    }

    public onConnectSuccess(): void {
        console.log("connection success");
        this.props.connection.AddRecieveListener(this.actionLog);
        this.props.user.doAction({
            actionId: actionIds.joinTable,
        });
    }

    public onConnectFail(): void {
        window.alert("Connection error.");
        this.props.translate(PageId.Entrance);
    }

    public onInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState<"input">({input: event.target.value})
    }
    
    public onSubmit(event: React.MouseEvent): void {
        this.props.connection.sendMessageAsync(this.state.input)
            .then(() => console.log("message sent."))
            .catch(() => console.error("could not send the message."));
    }

    private updateTableView(): void {
        this.setState<"players">({ players: this.table.players });
    }
 
    public render(): ReactNode {
        return (
            <div id="table">
                <h1>TABLE</h1>
                <label>
                    Name:
                    <input type="text" value={this.state.input} onChange={this.onInputChange.bind(this)} />
                </label>
                <input type="button" value="Submit" onClick={this.onSubmit.bind(this)}/>
                <div>
                    <ul> {this.state.players.map(player => 
                        <li key={player.playerId}>
                            <PlayerView player={player}/> 
                        </li>
                    )} </ul>
                </div>
            </div>
        );
    }
}