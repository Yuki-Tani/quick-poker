import React, { ReactNode } from "react";
import { Player } from "../model/Player";
import { User } from "../model/User";

export type PlayerViewProps = {
    user: User;
    player: Player;
}

export type PlayerViewStates = {
    betAmount: number
}

export class PlayerView extends React.Component<PlayerViewProps, PlayerViewStates> {

    constructor(props: PlayerViewProps) {
        super(props);
        this.state = {betAmount: 0};
    }

    private onFold(): void {
        this.props.user.doAction({
            actionId: "Fold",
        });
    }

    private onCall(): void {
        this.props.user.doAction({
            actionId: "Call",
        })
    }

    private onBet(): void {
        this.props.user.doAction({
            actionId: "Bet",
            amount: this.state.betAmount,
        })
    }

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
                        <div/>
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
                {
                    this.props.player.isUnderControl && this.props.player.isAction ? 
                        <div>
                            <input type="button" value="Fold" onClick={this.onFold.bind(this)}/>
                            <input type="button" value="Call" onClick={this.onCall.bind(this)} />
                            <input type="button" value="Raise" onClick={this.onBet.bind(this)} />
                            <input type="text" value={this.state.betAmount} onChange={event => {
                                const amount = parseInt(event.target.value);
                                this.setState<"betAmount">({betAmount: isNaN(amount) ? 0 : amount});
                            }} />
                        </div>
                    :  
                        <div />
                }
            </div>
        );
    }
}