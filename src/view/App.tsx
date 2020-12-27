import './App.css';
import { Connection } from '../model/Connection';
import React, { ReactNode } from 'react';
import { Entrance } from './Entrance';
import { PageId } from '../model/Page';
import { Table, TableProps, TableStates } from './Table';
import { User } from '../model/User';

export interface AppStates {
  pageId: PageId;
}

export class App extends React.Component<{}, AppStates>{
  private readonly connection = new Connection();
  private user = new User("", this.connection);

  public constructor(props: {}) {
    super(props);
    this.state = { pageId: PageId.Entrance };
  }

  public setUser(name: string): void {
    this.user = new User(name, this.connection);
  }

  public translatePage(id: PageId) {
    if (id === PageId.Table && this.user.isDefaultUser()) {
      window.alert("please input user name.");
      return;
    }
    this.setState<"pageId">({ pageId: id });
  }

  public render(): ReactNode {
    switch(this.state.pageId) {
      case PageId.Entrance :
        return (
          <Entrance 
            setUser={this.setUser.bind(this)}
            translate={this.translatePage.bind(this)}/>
        );
      case PageId.Table :
        return (
          <Table 
            connection={this.connection}
            user={this.user}
            translate={this.translatePage.bind(this)}
          />
        );
    }
  }
}
