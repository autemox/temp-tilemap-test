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

    constructor(
        public game: Game,
        public app: Application,
        objTemplate: ObjTemplate,
        type: string,
        location: Point,
        id: number,
        public name: string) {

        super(game, app, objTemplate, type, location, id, name);

        // add filter
        this.s.filters = [
            new PIXI.filters.BevelFilter(),
            new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
        ];

        // watch controls
        const speed = new PIXI.Point(objTemplate.speedX, objTemplate.speedY);
        this.left.press = () => this.velocityX = -speed.x;
        this.left.release = () => this.velocityX = this.right.isUp ? 0 : speed.x;
        this.right.press = () => this.velocityX = speed.x;
        this.right.release = () => this.velocityX = this.left.isUp ? 0 : -speed.x;

        this.up.press = () => this.velocityY = -speed.y;
        this.up.release = () => this.velocityY = this.down.isUp ? 0 : speed.y;
        this.down.press = () => this.velocityY = speed.y;
        this.down.release = () => this.velocityY = this.up.isUp ? 0 : -speed.y;
    }

    public set velocityX(x) {
        this.v.x = x;
        this.game.connection.update(true);
    }
    public set velocityY(y) {
        this.v.y = y;
        this.game.connection.update(true);
    }

    alive() {

        // perform regular alive GameObj tasks
        super.alive();

        // location can be percise
        this.s.position = this.l;
    }
}
