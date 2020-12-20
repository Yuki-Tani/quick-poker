import './App.css';
import { Connection } from '../model/Connection';
import React, { ReactNode } from 'react';
import { Entrance } from './Entrance';
import { PageId } from '../model/Page';
import { Table } from './Table';

export class App extends React.Component<{}, { pageId: PageId }>{
  private readonly connection: Connection;

  public constructor(props: {}) {
    super(props);
    this.state = { pageId: PageId.Entrance };
    this.connection = new Connection();
  }

  public componentDidMount(): void {
    this.connection.connectAsync()
      .then((isConnected) => window.confirm(`${isConnected ? "Connected!" : "Failed connection"}`))
      .catch(() => window.alert("Unexpected Error."));
  }

  public translatePage(id: PageId) {
    this.setState<"pageId">({ pageId: id });
  }

  public render(): ReactNode {
    switch(this.state.pageId) {
      case PageId.Entrance :
        return (
          <Entrance translate={this.translatePage.bind(this)}/>
        );
      case PageId.Table :
        return (
          <Table connection={this.connection} />
        );
    }
  }
}
