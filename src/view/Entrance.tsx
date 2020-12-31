import React, { ReactNode } from "react";
import { PageId, TranslatePage } from "../model/Page";

export type EntranceProps = {
    setUser : (name: string) => void;
    translate : TranslatePage;
}

export type EntranceStates = {
    userName : string
}

export class Entrance extends React.Component<EntranceProps, EntranceStates> {
    private readonly translate: TranslatePage;

    constructor(props: EntranceProps) {
        super(props);
        this.translate = props.translate;
        this.state = { userName : "" };
    }

    private joinTable(): void {
        this.props.setUser(this.state.userName);
        this.translate(PageId.Table);
    }

    private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState<"userName">({ userName: event.target.value });
    }

    public render(): ReactNode {
        return (
            <div id="entrance">
                <label>User Name: </label>
                <input type="text" value={this.state.userName} onChange={this.onChange.bind(this)}/>
                <input type="button" value="Join Table" onClick={this.joinTable.bind(this)} />
            </div>
        );
    }
}