import React, { ReactNode } from "react";
import { Player } from "../model/Player";

export type PlayerViewProps = {
    player: Player;
}

export type PlayerViewStates = {
}

export class PlayerView extends React.Component<PlayerViewProps, PlayerViewStates> {

    constructor(props: PlayerViewProps) {
        super(props);
    }

    public render(): ReactNode {
        return (
            <div id="player">
                <p>{this.props.player.playerId} : </p>
                <ul>
                    <li> Stack: ${this.props.player.stack.amount} </li>
                </ul>
            </div>
        );
    }
}