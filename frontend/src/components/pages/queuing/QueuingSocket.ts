/**
 * A class that, when constructed, makes connection to a socket
 * and acts upon the following socket events: open, close, message and error.
 * Closes all connections and event listeners when the 'shutdown' method is called.
 */
export class QueuingSocket {
    private roomCode: string;
    private sock: WebSocket;
    private onSockOpen: () => any | null;
    private onSockClose: (closeEvent: CloseEvent) => void;
    private onSockMessage: (messageEvent: MessageEvent) => void;
    private onSockError: () => void;

    constructor(
        roomCode: string,
        onSockOpen: () => void,
        onSockClose: (closeEvent: CloseEvent) => void,
        onSockMessage: (messageEvent: MessageEvent) => void,
        onSockError: () => void,
        caller: any,
    ) {
        this.roomCode = roomCode;
        this.sock = this.connect();
        this.onSockOpen = onSockOpen.bind(caller);
        this.onSockClose = onSockClose.bind(caller);
        this.onSockMessage = onSockMessage.bind(caller);
        this.onSockError = onSockError.bind(caller);

        this.sock.addEventListener("open", this.onSockOpen);
        this.sock.addEventListener("close", this.onSockClose);
        this.sock.addEventListener("message", this.onSockMessage);
        this.sock.addEventListener("error", this.onSockError);
    }

    shutdown() {
        this.sock.removeEventListener("open", this.onSockOpen);
        this.sock.removeEventListener("close", this.onSockClose);
        this.sock.removeEventListener("message", this.onSockMessage);
        this.sock.removeEventListener("error", this.onSockError);
        this.sock.close();
    }

    private connect() {
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        const port = location.port.length > 0 ? `:${location.port}` : "";
        const wsUrl = `${protocol}://${
            location.hostname
        }${port}/ws/queuing/rooms/${this.roomCode}/feed`;
        return new WebSocket(wsUrl);
    }
}
