import React, { ReactNode } from "react";
import { actionIds } from "../model/Action";
import { ActionLog } from "../model/ActionLog";
import { Card } from "../model/Card";
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
    players: Player[],
    flopCards: Card[]
}

export class TableView extends React.Component<TableViewProps, TableViewStates> {
    private actionLog: ActionLog;
    private table: Table;

    constructor(props: TableViewProps) {
        super(props);
        this.state = { players: [], flopCards: [] };
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

    private updateTableView(): void {
        this.setState<"players">({ players: this.table.players });
        this.setState<"flopCards">({flopCards: []}) // TODO
    }
 
    public render(): ReactNode {
        return (
            <div id="table">
                <h1>TABLE</h1>
                <div>
                    <ul> {this.state.players.map(player => 
                        <li key={player.playerId}>
                            <PlayerView player={player} user={this.props.user}/> 
                        </li>
                    )} </ul>
                </div>
            </div>
        );
    }
}