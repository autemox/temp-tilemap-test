import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
import { LoadAssets } from './utils/LoadAssets';
import { World } from './world/World';
import { UI } from './UI';
import { PixiUtils } from './utils/PixiUtils';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class Game {

    // class Game is a singleton class
    private static instance: Game;

    // game state
    public state: Function;                            // state of the game ie play, pause
    public ui: UI;

    // world heirarchy
    public world: World;                           // container all sprites and tiles go into
    public god = 2;

    // asset list
    public assets: Array<String> = [
        'assets/images/chicken-spritesheet.json',
        'assets/images/terrian-01-spritesheet.json',
        'assets/map-001.json'
    ];

    public maps: Array<String> = [
        'assets/map-001.json'
    ];

    private constructor(public app: Application) {      // constructor is private b/c Game is a singleton class

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;   // retain pixelation

        // load assets
        const loadWorld = new LoadAssets(this, this.assets);
    }

    static getInstance(app: Application= null) {        // getInstance creates and returns the singleton class, Game
        if (!Game.instance && app) Game.instance = new Game(app);  // create the instance if not yet created
        return Game.instance;
    }

   loaded() {

        // create the world
        this.world = new World(this, this.app);

        // begin the game
        this.app.ticker.add((delta) => this.gameLoop(delta));
        this.state = this.play;

        // load UI
        this.ui = new UI(this);
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
        for (let i = 0, len = this.world.objs.length; i < len; i++)
        {
            this.world.objs[i].update(delta);
        }

        // add filter to entire world
        this.app.stage.filters = [
            new PIXI.filters.GodrayFilter(-20, 0.5, this.god, true, 0)
        ];
        this.god += .0001;

        // sort sprites, lower on screen to the front
        this.world.container.children.sort((a, b) => a.position.y > b.position.y ? 1 : 0);
    }
}
