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
import { GameObj } from '../world/objs/GameObj';
import { Player } from '../world/objs/Player';
import { NPC } from '../world/objs/NPC';


export class Connection {

    // ABOUT THIS CLASS
    // this class controls our connection to the server, including initiating it, monitoring it

    socketService: SocketService;           // the socket service that does actual sending and receiving of packets
    ioConnection: any;                      // our subscription for observing socket service
    user: User;                             // this current user obj to be sent with any packets
    status = 'connecting';                  // a string representing current network status: connected, disconnected, connecting
    lat = 0;                                // latency

    // sends ping (location update) to server every 0.25-1 seconds depending on necessity (if they are actively moving)
    lastUpdate: number;                     // the last time a packet was sent to the network
    updateFrequency: number = 1 * 60;       // the slowest which location pings can be sent 1 * 60 = every 1 second
    maxUpdateFrequency: number = 1 * 60 / 4; // the maximum speed which location pings can be sent 1 * 60 / 4 = 4 times a second
    needPing: Boolean = false;

    messages: Message[] = [];               // a list of messages from this and other clients

    constructor(public game: Game) {

        this.socketService = new SocketService();        // Socket handles actual socket object and makes communication easy

        this.user = {                                    // create a random user for now
            id: F.generateID(),
            name: ['Omar', 'Dwayne', 'Eloy', 'Floyd', 'Jan', 'Vonda', 'Jeffrey', 'Harris', 'Eugene', 'Raleigh', 'Heriberto', 'Janet', 'Vince', 'Dirk', 'Fernando', 'Shelton', 'Quincy', 'Abdul', 'Marlon', 'Fermin'][F.ranInt(0, 19)]
        };

        this.initIoConnection();                        // initiate connection including subscribing to new messages
    }

    // check if its time to ping or not (ping occurs every 0.25 - 1.00 seconds)
    public update(needPing?: Boolean) {

        // ping server with your location regularly
        if (needPing) this.needPing = true;             // getting message from player that we need to update because hes moving around a lot
        this.lastUpdate++;                              // every 1 second send notification with current location to other players.  sometimes called more frequently
        if (this.lastUpdate > this.updateFrequency || this.lastUpdate > this.maxUpdateFrequency && this.needPing) this.ping();
    }

    // sends ping (location update) to server
    public ping() {

        // check if player exists and if so, update network
        if (this.game.world.player) {

            this.lastUpdate = 0;
            this.updateUser();                        // make sure this.user is up to date
            this.sendMessage(Action.PING);       // send packet to server with ping (updated location, etc)
        }
    }

    // User variables are updated to match player's game object
    private updateUser() {

        this.user.l = this.game.world.player.l;           // update our info on where player located actual
        this.user.v = this.game.world.player.v;
        this.user.scaleX = this.game.world.player.s.scale.x;
    }

    // User.var is applied to game object
    private updateClient(client: Client|GameObj|Player|NPC, user: User) {

        client.l = user.l;
        client.v = user.v;
        client.s.scale.x = user.scaleX;
    }

    // a packet was received, do as action requires
    private do(action: Action, user: User, content: any) {

        switch (action) {
            case Action.PING: {                                    // do no action, just a ping (location update)

                break;
            }
            case Action.JOINED: {                                  // create client if it is new client

                console.log('a new user has joined', user);
                this.game.world.addObject('chicken', 'client', user.l, user.id, user.name);
                break;
            }
            case Action.LEFT: {                                    // create client if it is new client

                console.log('a user has left', user);
                F.findByID(this.game.world.objs, user.id).remove();
              break;
            }
            case Action.TEXT: {                                    // another client is sending you a text message

                console.log('received message', content);
                this.messages.push(content);
                break;
            }
            default: {

                console.log('error.  action not valid.');
                break;
            }
        }
    }

    // service handles 3 events in this socket connection: MESSAGE, CONNECT, and DISCONNECT
    private initIoConnection(): void {
        this.socketService.initSocket();

        // "MESSAGE" EVENT: RECEIVE A MESSAGE (AKA A NORMAL PACKET OF ANY KIND)
        this.ioConnection = this.socketService.onMessage()
            .subscribe((message: Message) => {

                const client: Client = F.findByID(this.game.world.objs, message.from.id);    // find client

                if (client && message.from.l && message.from.v) {                            // update client info if data is available

                    this.updateClient(client, message.from);                                 // location and velocity

                    const lat = new Date().getTime() - message.timestamp;                    // latency calc
                    client.latency = (client.latency * 9 + lat) / 10;                        // time-average latency
                }

                this.do(message.action, message.from, message.content);                      // fulfill the action specified in packet
            }
        );

        // "CONNECT" EVENT: YOU HAVE CONNECTED SUCCESSFULLY
        this.socketService.onEvent(Event.CONNECT)
            .subscribe((socket) => {

              this.status = 'connected';
              this.user.id = socket.id;                     // you have been assigned a unique id to be used in user and on your game object
              this.game.connected(this.user);               // create world (including player)

              this.updateUser();                            // make sure this.user is up to date
              this.sendMessage(Action.JOINED);              // tell server you have joined the game
          });

        // "DISCONNECT" EVENT: YOU HAVE BEEN DISCONNECTED
        this.socketService.onEvent(Event.DISCONNECT)
            .subscribe((socket) => {

                this.status = 'disconnected';
                this.game.state = this.game.pause;            // pause game b/c we are disconnected
                this.game.world.player.remove();              // prevent the player from moving
          });
    }

    // SEND A MESSAGE / ACTION OUT
    public sendMessage(action: Action, content?: any): void { // ex: sendMessage(Action.TEXT, "hello there!");

        const message: Message = {             // create the message to be sent to server
            from: this.user,
            action: action,
            content: content,
            timestamp: new Date().getTime()
        }

        this.socketService.send(message);       // send the message
        this.lastUpdate = 0;                    // reset ping countdown
    }
}
