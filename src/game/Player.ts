import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from './utils/F';
import { GameObj } from './world/objs/GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';

export class Player extends GameObj {

    public left = F.keyboard(37);
    public up = F.keyboard(38);
    public right = F.keyboard(39);
    public down = F.keyboard(40);

    constructor(
        public app: Application,
        frames: Array<Texture>,
        location: Point) {

        super(app, frames, location);

        // add filter
        this.s.filters = [
            new PIXI.filters.BevelFilter(),
            new PIXI.filters.GlowFilter(12, .3, .25, 0xFFFFFF, 1)
        ];

        // watch controls
        this.left.press = () => this.v.x = -1;
        this.left.release = () => this.v.x = this.right.isUp ? 0 : 1;
        this.right.press = () => this.v.x = 1;
        this.right.release = () => this.v.x = this.left.isUp ? 0 : 1;

        this.up.press = () => this.v.y = -1;
        this.up.release = () => this.v.y = this.down.isUp ? 0 : 1;
        this.down.press = () => this.v.y = 1;
        this.down.release = () => this.v.y = this.up.isUp ? 0 : 1;
    }
}
