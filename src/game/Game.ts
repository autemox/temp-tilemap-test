import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
import { LoadAssets } from './utils/LoadAssets';
import { World } from './world/World';
import { UI } from './UI';
import { AnimationTemplate } from './model/AnimationTemplate';
import { ObjTemplate } from './model/ObjTemplate';
import { PixiUtils } from './utils/PixiUtils';
import { Dictionary } from './utils/Dictionary';
import { Connection } from './socket/Connection';
import { User } from './model/socket/user';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class Game {

    // class Game is a singleton class
    private static instance: Game;

    // game state
    public state: Function;                            // state of the game ie play, pause
    public ui: UI;
    public mouseFocused: Boolean;

    // connection and networking
    public connection: Connection;

    // world heirarchy
    public world: World;                           // container all sprites and tiles go into
    public god = 2;                                // controls animation of godrays

    // asset list
    public assets: Array<String> = [
        'assets/images/chicken.json',
        'assets/images/terrian-01.json',
        'assets/images/chick.json',
        'assets/images/egg.json',
        'assets/images/human-01.json',
        'assets/images/benjiro-01.json',
        'assets/map-002.json'
    ];

    public maps: Array<String> = [
        'assets/map-002.json'
    ];

    public mapToLoad = 'map-002';

    public templates = new Dictionary<ObjTemplate>();
    private objTemplates = [   // do not reference direct.  reference Dictionary templates instead
        {
            name: 'human',
            sheet: 'human-01',
            animationSpeed: 0.2,
            animations: {
                stand: [61],
                stand_up: [75],
                stand_down: [45],
                walk: [68, 67, 66, 67, 68, 65, 64, 63, 62, 63, 64, 65],
                walk_down: [46, 47, 48, 53, 46, 45, 49, 50, 51, 52, 49, 45],
                walk_up: [76, 77, 78, 79, 75, 80, 81, 82, 75],
                idle: [61],
                death: [60]
            },
            speedX: 2,
            speedY: 1,
            runModifier: 2,
            textures: undefined
        },
        {
            name: 'chicken',
            animationSpeed: 0.08,
            animations: {
                stand: [0],
                walk: [1, 0, 2, 0],
                idle: [3, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0],
                death: [5, 6, 7, 6, 7, 8, 8]
            },
            speedX: 1.9,
            speedY: .6,
            runModifier: 2,
            textures: undefined
        },
        {
            name: 'chick',
            animationSpeed: 0.25,
            animations: {
                stand: [13],
                walk: [9, 13, 12, 13],
                idle: [12, 11, 10, 11, 12, 13, 13, 13, 13, 13, 13, 12, 11, 10, 11, 12, 13, 13, 13, 12, 11, 10, 11, 12, 13],
                death: [5, 6, 7, 6, 7]
            },
            speedX: .8,
            speedY: .5,
            runModifier: 2,
            textures: undefined
        },
        {
            name: 'egg',
            animationSpeed: 0.25,
            animations: {
                stand: [0],
                walk: [0],
                idle: [0],
                death: [0, 1, 2, 3]
            },
            speedX: .4,
            speedY: .25,
            runModifier: 2,
            textures: undefined,
            scale: .9
        }
    ];

    private constructor(public app: Application) {      // constructor is private b/c Game is a singleton class

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;   // retain pixelation

        // load object templates and set default values
        for (let i = 0; i < this.objTemplates.length; i++) {
            this.objTemplates[i].scale = this.objTemplates[i].scale ? this.objTemplates[i].scale : 1;    // set default value for scale

            this.templates.Add(this.objTemplates[i].name, this.objTemplates[i]);                         // save to templates Dictionary
        }

        // load assets
        const loadWorld = new LoadAssets(this, this.assets);
    }

    static getInstance(app: Application= null) {        // getInstance creates and returns the singleton class, Game
        if (!Game.instance && app) Game.instance = new Game(app);  // create the instance if not yet created
        return Game.instance;
    }

   loaded() {

        // connect to server
        this.connection = new Connection(this);
   }

   connected(user: User) {

        // create the world
        if (this.world) this.world.remove();                           // if not our first time connecting, remove the old world
        this.world = new World(this, this.app, this.mapToLoad, user);   // create a new world

        if (!this.state) {
                                                     // is this our first time connecting?
            // load UI
            this.ui = new UI(this);

            // start game interval (1 second)
            this.app.ticker.add((delta) => this.gameLoop(delta));      // interval every frame
       }

       // begin the game
       this.state = this.play;                                         // this.state can be set to this.play or this.pause or undefined if game hasnt started yet
   }

    // repeats approx every frame (60 times per second)
    gameLoop(delta) {

        this.state(delta); // run the function of the current game state

        // ui and debugging
        this.ui.update();

        // check if game is focused (if mouse is on canvas)
        this.mouseFocused = !F.boundary(this.app.renderer.plugins.interaction.mouse.global, this.app.screen);

        // networking
        this.connection.update();
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

        // animate stage filter
        this.app.stage.filters = [
            new PIXI.filters.GodrayFilter(-20, 0.5, this.god, true, 0)
        ];
        this.god += .0001;

        // sort sprites, lower on screen to the front
        this.world.spriteContainer.children.sort((a, b) => {
          if (a.position.y > b.position.y) return 1;
          if (a.position.y < b.position.y) return -1;
        });

        // control camera
        this.world.container.scale.set(this.app.screen.width / 2000);
        if (this.world.player) {
            // place camera on player
            const camera = new PIXI.Point(this.world.player.x, this.world.player.y);
            // prevent camera from going outside of map
            F.boundary(
                camera,
                new PIXI.Rectangle(
                    this.app.screen.width / (2 * this.world.container.scale.x),
                    this.app.screen.height / (2 * this.world.container.scale.y),
                    this.world.map.width * this.world.tile.width - this.app.screen.width / this.world.container.scale.x,
                    this.world.map.height * this.world.tile.height - this.app.screen.height / this.world.container.scale.y
                )
            );
            // move stage to center camera
            this.world.container.position.set(
                -camera.x * this.world.container.scale.x + this.app.screen.width / 2,
                -camera.y * this.world.container.scale.y + this.app.screen.height / 2
            );
        }
    }
}
