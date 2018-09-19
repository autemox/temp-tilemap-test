import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
import { LoadAssets } from './utils/LoadAssets';
import { World } from './world/World';
import { UI } from './UI';
import { AnimationTemplate } from './models/AnimationTemplate';
import { ObjTemplate } from './models/ObjTemplate';
import { PixiUtils } from './utils/PixiUtils';
import { Dictionary } from './utils/Dictionary';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class Game {

    // class Game is a singleton class
    private static instance: Game;

    // game state
    public state: Function;                            // state of the game ie play, pause
    public ui: UI;
    public mouseFocused: Boolean;

    // world heirarchy
    public world: World;                           // container all sprites and tiles go into
    public god = 2;

    // asset list
    public assets: Array<String> = [
        'assets/images/chicken.json',
        'assets/images/terrian-01.json',
        'assets/images/chick.json',
        'assets/images/egg.json',
        'assets/map-001.json'
    ];

    public maps: Array<String> = [
        'assets/map-001.json'
    ];

    public templates = new Dictionary<ObjTemplate>();
    private objTemplates = [   // do not reference direct.  reference Dictionary templates instead
        {
            name: 'chicken',
            animationSpeed: 0.08,
            animations: {
                stand: [1],
                walk: [1, 0, 2, 0],
                idle: [4, 0, 0, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0],
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
                stand: [1],
                walk: [9, 13, 12, 13],
                idle: [9, 13, 12, 11, 12, 13, 9, 9, 9, 9, 9, 9, 9, 9, 9],
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

        // create the world
        this.world = new World(this, this.app, 'map-001');

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

        // check if game is focused (if mouse is on canvas)
        this.mouseFocused = !F.boundary(this.app.renderer.plugins.interaction.mouse.global, this.app.screen);

        // control camera
        this.app.stage.scale.set(.6);
        if (this.world.player) {
            // place camera on player
            const camera = new PIXI.Point(this.world.player.x, this.world.player.y);
            // prevent camera from going outside of map
            F.boundary(
                camera,
                new PIXI.Rectangle(
                    this.app.screen.width / (2 * this.app.stage.scale.x),
                    this.app.screen.height / (2 * this.app.stage.scale.y),
                    this.world.map.width * this.world.tile.width - this.app.screen.width / this.app.stage.scale.x,
                    this.world.map.height * this.world.tile.height - this.app.screen.height / this.app.stage.scale.y
                )
            );
            // move stage to center camera
            this.app.stage.position.set(
                -camera.x * this.app.stage.scale.x + this.app.screen.width / 2,
                -camera.y * this.app.stage.scale.x + this.app.screen.height / 2
            );
        }
        
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
        this.world.container.children.sort((a, b) => a.position.y > b.position.y ? 1 : 0);
    }
}
