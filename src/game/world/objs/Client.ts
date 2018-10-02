import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { GameObj } from './GameObj';
import {GlowFilter} from '@pixi/filter-glow';
import {BevelFilter} from '@pixi/filter-bevel';
import { Game } from '../../Game';
import { ObjTemplate } from '../../model/ObjTemplate';

// ABOUT THIS CLASS
// a client is any object that is player, but not necessarily the actual player, but another online player

export class Client extends GameObj {

    public latency = 0;            // a number that represents how quickly this clients packages are arriving

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
        if (F.ranBool()) {
            if (F.ranBool()) {
                this.s.filters = [
                    new PIXI.filters.ColorReplaceFilter(0xf0d840, 0xffde00, 0.1),  // belt
                    new PIXI.filters.ColorReplaceFilter(0x40d870, 0x318dff, 0.1),  // shirt light color
                    new PIXI.filters.ColorReplaceFilter(0x389068, 0x2d6dbb, 0.1),  // shirt dark color
                    new PIXI.filters.ColorReplaceFilter(0xf87800, 0xf5da5d, 0.1),  // shoes light color
                    new PIXI.filters.ColorReplaceFilter(0xc01820, 0xd4bb47, 0.1),  // shoes dark color
                    new PIXI.filters.ColorReplaceFilter(0xfdb637, 0xfeeb6c, 0.1),  // hair light color
                    new PIXI.filters.ColorReplaceFilter(0xfb863d, 0xfccf6d, 0.1),  // hair dark color
                    new PIXI.filters.ColorReplaceFilter(0xf0a068, 0xffd2ae, 0.1),  // skin light color
                    new PIXI.filters.ColorReplaceFilter(0xb86820, 0xe9a779, 0.1),  // skin dark color
                    new PIXI.filters.BevelFilter(),
                    new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
                ];
            }
            else {
                this.s.filters = [
                    new PIXI.filters.ColorReplaceFilter(0xf0d840, 0x000000, 0.1),  // belt
                    new PIXI.filters.ColorReplaceFilter(0x40d870, 0xff0200, 0.1),  // shirt light color
                    new PIXI.filters.ColorReplaceFilter(0x389068, 0x941817, 0.1),  // shirt dark color
                    new PIXI.filters.BevelFilter(),
                    new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
                ];
            }
        }
        else if (F.ranBool()) {
            this.s.filters = [
                new PIXI.filters.ColorReplaceFilter(0xf0d840, 0xffde00, 0.1),  // belt
                new PIXI.filters.ColorReplaceFilter(0x40d870, 0x81bf31, 0.1),  // shirt light color
                new PIXI.filters.ColorReplaceFilter(0x389068, 0x5e852b, 0.1),  // shirt dark color
                new PIXI.filters.ColorReplaceFilter(0xf87800, 0xf5da5d, 0.1),  // shoes light color
                new PIXI.filters.ColorReplaceFilter(0xc01820, 0xd4bb47, 0.1),  // shoes dark color
                new PIXI.filters.ColorReplaceFilter(0xfdb637, 0x7f4c29, 0.1),  // hair light color
                new PIXI.filters.ColorReplaceFilter(0xfb863d, 0x5c371e, 0.1),  // hair dark color
                new PIXI.filters.ColorReplaceFilter(0xf0a068, 0xc98758, 0.1),  // skin light color
                new PIXI.filters.ColorReplaceFilter(0xb86820, 0x864f1d, 0.1),  // skin dark color
                new PIXI.filters.BevelFilter(),
                new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
            ];
        }
        else {
            this.s.filters = [
                new PIXI.filters.BevelFilter(),
                new PIXI.filters.GlowFilter(10, .3, .25, 0xFFFFFF, 1)
            ];
        }
    }
}
