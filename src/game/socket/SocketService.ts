import { Observable } from 'rxjs/Observable';
import * as socketIo from 'socket.io-client';
import { Message } from '../model/socket/message';
import { Event } from '../model/socket/event';
import { User } from '../model/socket/user';

const SERVER_URL = 'http://localhost:8080';

export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public onNewUser(): Observable<User> {
        return new Observable<User>(observer => {
            this.socket.on('newuser', (data: User) => observer.next(data));
        });
    }

    public onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on('message', (data: Message) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next(this.socket));
        });
    }
}
