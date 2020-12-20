import React, { ReactNode } from "react";
import { PageId, TranslatePage } from "../model/Page";

export type EntranceProps = {
    translate : TranslatePage;
}

export type EntranceStates = {

}

export class Entrance extends React.Component<EntranceProps, EntranceStates> {
    private readonly translate: TranslatePage;

    constructor(props: EntranceProps) {
        super(props);
        this.translate = props.translate;
        this.state = { };
    }

    private createNewTable(): void {
        this.translate(PageId.Table);
    }

    private joinTable(): void {
        this.translate(PageId.Table);
    }

    public render(): ReactNode {
        return (
            <div id="entrance">
                <input type="button" value="Create New Table" onClick={this.createNewTable.bind(this)} />
                <input type="button" value="Join Table" onClick={this.joinTable.bind(this)} />
            </div>
        );
    }
}