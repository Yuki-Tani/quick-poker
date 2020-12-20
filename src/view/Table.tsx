import React, { ReactNode } from "react";
import { Connection, RecieveEventListener } from "../model/Connection";

export type TableProps = {
    connection: Connection;
}

export type TableStates = {
    input: string,
    newMessage: string
}

export class Table extends React.Component<TableProps, TableStates> implements RecieveEventListener {
    private readonly connection: Connection

    constructor(props: TableProps) {
        super(props);
        this.connection = props.connection;
        this.state = { input: "", newMessage: "No Message" };
    }

    public componentDidMount(): void {
        this.connection.connectAsync()
            .then((isConnected) => window.confirm(`${isConnected ? "Connected!" : "Failed connection"}`))
            .catch(() => window.alert("Unexpected Error."));
        this.connection.AddRecieveListener(this);
    }

    public componentWillUnmount(): void {
        this.connection.RemoveRecieveListener(this);
    }

    public onInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState<"input">({input: event.target.value})
      }
    
    public onSubmit(event: React.MouseEvent): void {
    if (!this.connection) {
        return;
    }
    this.connection.sendMessageAsync(this.state.input)
        .then(() => {
        console.log("message sent.");
        }).catch(() => {
        console.error("could not send the message.")
        });
    }
    
    public onRecieve(message: string): void {
    this.setState<"newMessage">({newMessage: message});
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