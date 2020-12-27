import React, { ReactNode } from "react";
import { actionIds } from "../model/Action";
import { ActionLog } from "../model/ActionLog";
import { Connection } from "../model/Connection";
import { PageId, TranslatePage } from "../model/Page";
import { User } from "../model/User";

export type TableProps = {
    connection: Connection;
    user: User;
    translate: TranslatePage;
}

export type TableStates = {
    input: string,
    newMessage: string
}

export class Table extends React.Component<TableProps, TableStates> {
    private actionLog: ActionLog;

    constructor(props: TableProps) {
        super(props);
        this.state = { input: "", newMessage: "No Message" };
        this.actionLog = new ActionLog(this.props.user);
    }

    public componentDidMount(): void {
        this.actionLog = new ActionLog(this.props.user);
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
                    {this.state.newMessage}
                </div>
            </div>
        );
    }
}