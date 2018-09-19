import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Injectable } from '@angular/core';

import { SocketService } from './SocketService';
import { F } from '../utils/F';
import { Message } from '../model/socket/message';
import { Event } from '../model/socket/event';
import { User } from '../model/socket/user';
import { Action } from '../model/socket/action';
import { Game } from '../Game';
import { Client } from '../world/objs/Client';


export class Connection {

    // ABOUT THIS CLASS
    // this class controls our connection to the server, including initiating it, monitoring it

    socketService: SocketService;           // the socket service that does actual sending and receiving of packets
    ioConnection: any;                      // our subscription for observing socket service
    user: User;                             // this current user obj to be sent with any packets
    status = 'connecting';                  // a string representing current network status: connected, disconnected, connecting
    lat = 0;                                // latency
    lastUpdate: number;                     // the last time a packet was sent to the network
    updateFrequency: number = 1 * 60;       // the slowest which location pings can be sent 1 * 60 = every 1 second
    maxUpdateFrequency: number = 1 * 60 / 4; // the maximum speed which location pings can be sent 1 * 60 / 4 = 4 times a second
    needPing: Boolean = false;

    messages: Message[] = [];               // a list of messages from this and other clients

    constructor(public game: Game) {

        this.socketService = new SocketService();        // Socket handles actual socket object and makes communication easy

        this.user = {                                    // create a random user for now
            id: F.generateID(),
            name: 'Autem' + F.ranInt(10, 99)
        };

        this.initIoConnection();                        // initiate connection including subscribing to new messages
    }

    public update(needPing?: Boolean) {

        // ping server with your location regularly
        if (needPing) this.needPing = true;             // getting message from player that we need to update because hes moving around a lot
        this.lastUpdate++;                              // every 1 second send notification with current location to other players.  sometimes called more frequently
        if (this.lastUpdate > this.updateFrequency || this.lastUpdate > this.maxUpdateFrequency && this.needPing) this.ping();
    }

    public ping() {

        // check if player exists and if so, update network
        if (this.game.world.player) {

            this.lastUpdate = 0;
            this.updateUser();
            this.sendNotification(Action.PING);
        }
    }

    private updateUser() {

        this.user.l = this.game.world.player.l;           // update our info on where player located actual
        this.user.v = this.game.world.player.v;
    }

    private initIoConnection(): void {
        this.socketService.initSocket();

        // EVENT RECEIVE A MESSAGE
        this.ioConnection = this.socketService.onMessage()
            .subscribe((message: Message) => {

                // save all non-ping messages
                if (message.action !== Action.PING) this.messages.push(message);

                // perform action specified
                if (message.action === Action.JOINED) {                     // create client if it is new client
                    console.log('a new user has joined', message.from);
                    this.game.world.addObject('chicken', 'client', message.from.l, message.from.id, message.from.name);
                }
                else if (message.action === Action.LEFT) {                     // create client if it is new client
                    console.log('a user has left', message.from);
                    F.findByID(this.game.world.objs, message.from.id).remove();
                }
                else if (message.content) {                                 // display content if there is any
                    console.log('received message', message);
                }

                // find client
                const client: Client = F.findByID(this.game.world.objs, message.from.id);

                // update client info if data is available
                if (client && message.from.l && message.from.v) {

                    // location and velocity
                    client.l = message.from.l;
                    client.v = message.from.v;

                    // calculate latency
                    const lat = new Date().getTime() - message.timestamp;
                    client.latency = (client.latency * 9 + lat) / 10;
                }
            }
        );

        // EVENT YOU HAVE CONNECTED
        this.socketService.onEvent(Event.CONNECT)
            .subscribe((socket) => {
              this.status = 'connected';
              this.user.id = socket.id;
              this.game.connected(socket.id, this.user.name);                 // create world (including player)
              this.updateUser();
              this.sendNotification(Action.JOINED);           // send notification of join
          });

        // EVENT YOU HAVE DISCONNECTED
        this.socketService.onEvent(Event.DISCONNECT)
            .subscribe((socket) => {
                this.status = 'disconnected';

                // disable game b/c we are disconnected
                this.game.state = this.game.pause;
                this.game.world.player.remove();
          });
    }

    // SEND A MESSAGE OUT
    public sendMessage(message: string): void {
        if (!message) return;

        this.socketService.send({
            from: this.user,
            content: message,
            timestamp: new Date().getTime()
        });
        this.lastUpdate = 0;
    }

    // SEND A NOTIFICATION / ACTION OUT
    public sendNotification(action: Action): void {

        this.socketService.send({
            from: this.user,
            action: action,
            timestamp: new Date().getTime()
        });
        this.lastUpdate = 0;
    }
}
