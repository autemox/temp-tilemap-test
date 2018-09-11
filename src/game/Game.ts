import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
import { LoadAssets } from './utils/LoadAssets';
import { CreateWorld } from './world/CreateWorld';
import { UI } from './UI';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class Game {

    // game state
    public state: Function;                            // state of the game ie play, pause
    public ui: UI;

    // world heirarchy
    public world: Container = new PIXI.Container();    // container all sprites and tiles go into
    public objs: Array<GameObj|Player|NPC> = [];       // Array of Game Objects, including Clients and Player
    public player: Player;                             // the current player

    constructor(public app: Application) {

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;   // retain pixelation

        // apply stage filters
        //app.stage.filters = [
        //    new PIXI.filters.GodrayFilter()
        //];

        // load UI
        this.ui = new UI(this);

        // load assets
        const loadWorld = new LoadAssets(this);
    }

   loaded() {

        // create the world
        const createWorld = new CreateWorld(this.app, this.world, this.objs, this.player);

        // begin the game
        this.app.ticker.add((delta) => this.gameLoop(delta));
        this.state = this.play;
   }

    gameLoop(delta) {

        this.state(delta); // run the function of the current game state

        // ui and debugging
        this.ui.update();
    }

    pause(delta) {

        /* do nothing*/
    }

    play(delta) {

        // loop through game objects and update them
        for (let i = 0, len = this.objs.length; i < len; i++)
        {
           this.objs[i].update(delta);
        }

        // sort sprites, lower on screen to the front
        this.world.children.sort((a, b) => a.position.y > b.position.y ? 1 : 0);
    }
}
