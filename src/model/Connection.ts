import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr"

export class Connection {
    private readonly apiBaseUrl = "http://localhost:7071";
    private readonly messageApiEndPoint = "messages";
    private readonly connection: HubConnection;
    private isReady = false;
    private readonly listeners: Set<RecieveEventListener>;

    public constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl(`${this.apiBaseUrl}/api`)
            .configureLogging(LogLevel.Information)
            .build();
        this.connection.on('newMessage', this.onRecieve.bind(this));
        this.connection.onclose(() => console.log('disconnected'));
        this.listeners = new Set();
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

    public async sendMessageAsync(message: string): Promise<void> {
        if (!this.isReady) {
            console.warn(`connection is not ready. cannot set this message: ${message}`);
            return;
        }
        await fetch(`${this.apiBaseUrl}/api/${this.messageApiEndPoint}`, {
            method: 'POST',
            body: message,
            mode: 'cors',
        });
    }

    public AddRecieveListener(listener: RecieveEventListener) {
        this.listeners.add(listener);
    }

    public RemoveRecieveListener(listener: RecieveEventListener) {
        this.listeners.delete(listener);
    }

    private onRecieve(message: string): void {
        this.listeners.forEach(listener => {
            listener.onRecieve(message);
        });
    }
}

export interface RecieveEventListener {
    onRecieve(message: string): void;
}
