import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from '../world/objs/GameObj';
import { Player } from '../world/objs/Player';
import { NPC } from '../world/objs/NPC';
import { F } from './F';
import { Game } from '../Game';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class LoadAssets {

    constructor(public game: Game) {

        // open the loader
        PIXI.loader.add([
            'assets/images/chicken-spritesheet.json',
            'assets/images/terrian-01-spritesheet.json'
        ])
            .on('progress', this.loadProgressHandler)         // monitors progress in console only
            .load(game.loaded.bind(game));                     // setup() runs after assets are loaded
    }

     // LOADING PROGRESS
     loadProgressHandler(loader, resource) {                   // monitors progress (console only)

        console.log(`loaded ${resource.url}. Loading is ${loader.progress}% complete.`);
    }
}
