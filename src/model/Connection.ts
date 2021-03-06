import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr"

export class Connection {
    private readonly apiBase = "https://quick-poker.service.signalr.net";
    private readonly localApiBase = "http://localhost:7071"
    private readonly messageApiEndPoint = "messages";
    private readonly connection: HubConnection;
    private isReady = false;
    private readonly listeners: Set<RecieveMessageEventListener>;

    public constructor() {
        const actualBaseUrl = window.location.host.startsWith("localhost") ? this.localApiBase : this.apiBase;
        this.connection = new HubConnectionBuilder()
            .withUrl(`${actualBaseUrl}/api`)
            .configureLogging(LogLevel.Information)
            .build();
        
        this.connection.on('newMessage', this.onRecieve.bind(this));
        this.connection.onclose(() => console.log('disconnected'));
        this.listeners = new Set();
    }

    public async connectAsync(): Promise<void> {
        console.log('connecting...');
        return this.connection.start()
            .then(() => new Promise<void>((resolve, _) => {
                console.log("connected");
                this.isReady = true;
                resolve();
            }))
            .catch(() => new Promise<void>((_, reject) => {
                console.log("connection failed.");
                this.isReady = false;
                reject();
            }));
    }

    public async sendMessageAsync(message: string): Promise<void> {
        if (!this.isReady) {
            console.warn(`connection is not ready. cannot set this message: ${message}`);
            return;
        }
        await fetch(`${this.connection.baseUrl}/${this.messageApiEndPoint}`, {
            method: 'POST',
            body: message,
            mode: 'cors',
        });
    }

    public AddRecieveListener(listener: RecieveMessageEventListener) {
        this.listeners.add(listener);
    }

    public RemoveRecieveListener(listener: RecieveMessageEventListener) {
        this.listeners.delete(listener);
    }

    public onRecieve(message: any): void {
        this.listeners.forEach(listener => {
            listener.onRecieveMessage(message);
        });
    }
}

export interface RecieveMessageEventListener {
    onRecieveMessage(message: any): void;
}
