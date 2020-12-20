import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr"

export class Connection {
    private readonly apiBaseUrl = "http://localhost:7071";
    private readonly messageApiEndPoint = "messages";
    private readonly connection: HubConnection;
    private isReady = false;

    public constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl(`${this.apiBaseUrl}/api`)
            .configureLogging(LogLevel.Information)
            .build();
        this.connection.on('newMessage', this.onRecieve);
        this.connection.onclose(() => console.log('disconnected'));
    }

    public async connectAsync(): Promise<boolean> {
        console.log('connecting...');
        return this.connection.start()
            .then(() => {
                console.log("connected");
                this.isReady = true;
                return true;
            })
            .catch(() => {
                console.log("disconnected.");
                this.isReady = false;
                return false;
            });
    }

    public async sendMessageAsync(messageJson: JSON): Promise<void> {
        await fetch(`${this.apiBaseUrl}/api/${this.messageApiEndPoint}`, {
            method: 'POST',
            body: JSON.stringify(messageJson),
        });
    }

    public onRecieve(message: string): JSON {
        return JSON.parse(message);
    }
}