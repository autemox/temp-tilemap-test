import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import {RGBSplitFilter} from '@pixi/filter-rgb-split';
import {ColorReplaceFilter} from '@pixi/filter-color-replace';

export class NPC extends GameObj {

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
        if (F.ranInt(1000) > 998)
        {
            s.scale.x *= -1;
            this.v.x = - s.scale.x / 3;
        }

        if (F.ranInt(1000) > 995)
        {
            if (this.v.x === 0) {
                this.v.x = - s.scale.x / 3;
                this.v.y = F.ranInt(-20, 20) / 70;
            }
            else this.v.y = this.v.x = 0;
        }

        // perform regular alive GameObj tasks
        super.alive();
    }
}
