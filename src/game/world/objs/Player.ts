import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import { Game } from '../../Game';
import { ObjTemplate } from '../../models/ObjTemplate';

export class Player extends GameObj {

    public type: String = 'player';                   // npc, player, client, or obj?
    public PLAYER_SPEED = 5;

    public left = F.keyboard(37);
    public up = F.keyboard(38);
    public right = F.keyboard(39);
    public down = F.keyboard(40);

    constructor(
        public game: Game,
        public app: Application,
        objTemplate: ObjTemplate,
        location: Point) {

        super(game, app, objTemplate, location);

        // add filter
        this.s.filters = [
            new PIXI.filters.BevelFilter(),
            new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
        ];

        // watch controls
        const speed = this.PLAYER_SPEED;
        this.left.press = () => this.v.x = -speed;
        this.left.release = () => this.v.x = this.right.isUp ? 0 : speed;
        this.right.press = () => this.v.x = speed;
        this.right.release = () => this.v.x = this.left.isUp ? 0 : speed;

        this.up.press = () => this.v.y = -speed;
        this.up.release = () => this.v.y = this.down.isUp ? 0 : speed;
        this.down.press = () => this.v.y = speed;
        this.down.release = () => this.v.y = this.up.isUp ? 0 : speed;
    }

    alive() {

        // perform regular alive GameObj tasks
        super.alive();
    }
}
