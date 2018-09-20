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
    }
}
