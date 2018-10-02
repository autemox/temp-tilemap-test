import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import { Game } from '../../Game';
import { Client } from './Client';
import { ObjTemplate } from '../../model/ObjTemplate';

export class Player extends Client {

    public left = F.keyboard(37);
    public up = F.keyboard(38);
    public right = F.keyboard(39);
    public down = F.keyboard(40);
    public p = new PIXI.Point();      // what key is the player pressing?

    constructor(
        public game: Game,
        public app: Application,
        objTemplate: ObjTemplate,
        type: string,
        location: Point,
        id: number,
        public name: string) {

        super(game, app, objTemplate, type, location, id, name);

        // watch controls
        this.left.press = () => this.p.x = -1;
        this.left.release = () => this.p.x = this.right.isUp ? 0 : 1;
        this.right.press = () => this.p.x = 1;
        this.right.release = () => this.p.x = this.left.isUp ? 0 : -1;

        this.up.press = () => this.p.y = -1;
        this.up.release = () => this.p.y = this.down.isUp ? 0 : 1;
        this.down.press = () => this.p.y = 1;
        this.down.release = () => this.p.y = this.up.isUp ? 0 : -1;
    }

    alive() {

        // set velocity according to what keys are being pressed
        const speed = this.getSpeed();                                                   // get up to date speed based on facing and running
        const newV: PIXI.Point = new PIXI.Point(this.p.x * speed.x, this.p.y * speed.y); // determine velocity based on speed and direction keys pressed
        let needUpdate = false;
        if (newV.x !== this.v.x || newV.y !== this.v.y) {                                // if velocity has changed we need to update velocity locally and on network
            console.log('velocty has changed', newV, this.v);
            this.v = newV;
            needUpdate = true;                                                            // set needUpdate to true so we call for a network update after super.alive() has been performed (so that we are facing correct direction for update)
        }

        // perform regular alive GameObj tasks
        super.alive();

        // location can be percise
        this.s.position = this.l;

        // request network update if needed.  we do this at the end because super.alive() updates facing direction and other vars
        if (needUpdate) this.game.connection.update(true);
    }
}
