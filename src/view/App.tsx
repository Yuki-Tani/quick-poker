import './App.css';
import { Connection, RecieveEventListener } from '../model/Connection';
import React, { ChangeEvent, ReactNode } from 'react';

export class App extends React.Component<{}, {input: string, newMessage: string}> implements RecieveEventListener{
  private connection?: Connection;

  public constructor(props: {}) {
    super(props);
    this.state = { input: "", newMessage: "No Message"};
  }

  public componentDidMount(): void {
    this.connection = new Connection();
    this.connection.connectAsync()
      .then((isConnected) => window.confirm(`${isConnected ? "Connected!" : "Failed connection"}`))
      .catch(() => window.alert("Unexpected Error."));
    this.connection.AddRecieveListener(this);
  }

  public componentWillUnmount(): void {
    this.connection?.RemoveRecieveListener(this);
  }

  public onInputChange(event: ChangeEvent<HTMLInputElement>): void {
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
      <div className="App">
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
