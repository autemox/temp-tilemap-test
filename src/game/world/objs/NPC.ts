import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import {RGBSplitFilter} from '@pixi/filter-rgb-split';
import {ColorReplaceFilter} from '@pixi/filter-color-replace';

export class NPC extends GameObj {

    public NPC_SPEED_X = .7;
    public NPC_SPEED_Y = .25;

    constructor(
        public app: Application,
        frames: Array<Texture>,
        location: Point) {

        super(app, frames, location);

        // add filter
        this.s.filters = [
            new PIXI.filters.ColorReplaceFilter([1, 0, 0], F.randomPastelRgb(), 0.4),
            new PIXI.filters.BevelFilter(),
            new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
        ];
    }

    alive() {

        // AI controls
        const s = this.s;
        if (F.ranInt(1000) > 998)     // random change they will turn around
        {
            s.scale.x *= -1;
            this.v.x = - s.scale.x * this.NPC_SPEED_X;
        }

        if (F.ranInt(1000) > 995)    // random change they will stop or start moving
        {
            if (this.v.x === 0) {
                this.v.x = - s.scale.x * this.NPC_SPEED_X;
                this.v.y = this.NPC_SPEED_Y * F.ranInt(0, 100) / 100;
            }
            else this.v.y = this.v.x = 0;
        }

        // perform regular alive GameObj tasks
        super.alive();
    }
}
