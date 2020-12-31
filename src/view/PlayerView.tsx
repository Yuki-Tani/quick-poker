import React, { ReactNode } from "react";
import { Player } from "../model/Player";

export type PlayerViewProps = {
    player: Player;
}

export type PlayerViewStates = {
}

export class PlayerView extends React.Component<PlayerViewProps, PlayerViewStates> {

    public render(): ReactNode {
        return (
            <div id="player">
                <p style={
                    this.props.player.isAction ? {color: "red"} : {color: "black"}
                }>{this.props.player.playerId} : </p>
                <ul>
                    <li> Stack: ${this.props.player.stack.amount} </li>
                    {this.props.player.currentBet !== 0 ? 
                        <li> Bet: ${this.props.player.currentBet} </li> :
                        <li/>
                    }
                </ul>
                {
                    this.props.player.hand.length === 2 && this.props.player.isUnderControl ?
                        <ul>
                            <li>{this.props.player.hand[0].suit} {this.props.player.hand[0].rank}</li>
                            <li>{this.props.player.hand[1].suit} {this.props.player.hand[1].rank}</li>
                        </ul> :
                    this.props.player.hand.length === 2 ?
                        <ul>
                            <li>?</li>
                            <li>?</li>
                        </ul>
                    :
                        <ul />
                }
            </div>
        );
    }
}