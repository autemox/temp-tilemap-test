import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import {RGBSplitFilter} from '@pixi/filter-rgb-split';
import {ColorReplaceFilter} from '@pixi/filter-color-replace';
import { Game } from '../../Game';
import { PixiUtils } from '../../utils/PixiUtils';
import { ObjTemplate } from '../../model/ObjTemplate';

export class NPC extends GameObj {

    public type: String = 'npc';                   // npc, player, client, or obj?
    public RUN_LENGTH = 2 * 60;

    public runCounter = 0;

    constructor(
        public game: Game,
        public app: Application,
        objTemplate: ObjTemplate,
        location: Point,
        id: number,
        public name: string) {

        super(game, app, objTemplate, location, id, name);

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

        if (this.runCounter > 0) {         // if running, countdown to stop
            this.runCounter --;
            if (this.runCounter === 0) this.startMoving();   // stop running
        }
        else if (F.ranInt(1000) > 998)     // random change they will turn around
        {
            s.scale.x *= -1;
            this.startMoving();
        }
        else if (F.ranInt(1000) > 995)    // random change they will stop or start moving
        {
            if (this.v.x === 0) {
                this.startMoving();
            }
            else this.v.y = this.v.x = 0;
        }

        if (this.collision.x !== 0) this.v.x *= -1;
        if (this.collision.y !== 0) this.v.y *= -1;

        // perform regular alive GameObj tasks
        super.alive();
    }

    onClick() {
        this.s.scale.x *= F.ranInt(100) > 50 ? 1 : -1;   // turn around sometimes
        this.startMoving();                              // start moving
        this.v.y = - Math.abs(this.v.y);                 // always walk towards top of page
        this.v.x *= this.objTemplate.runModifier;                   // run
        this.runCounter = this.RUN_LENGTH;               // set how long to run

        const frames = PIXI.utils.TextureCache['assets/images/egg.json_image'];         // select frames from textures spritesheet for use in this object
        const o = this.game.world.addObject('egg', 'obj', new PIXI.Point(this.x, this.y), F.generateID());
        o.s.rotation = 0.15;
    }

    startMoving() {
        this.v.x = - this.s.scale.x * this.objTemplate.speedX;
        this.v.y = this.objTemplate.speedY * F.ranInt(0, 100) / 100;
    }
}
