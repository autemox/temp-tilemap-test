import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './objs/GameObj';
import { Player } from './objs/Player';
import { NPC } from './objs/NPC';
import { F } from '../utils/F';
import { PixiUtils } from '../utils/PixiUtils';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class World {

    public container = new PIXI.Container();

    public objs: Array<GameObj|Player|NPC> = [];       // Array of World Objects, including Clients and Player
    public player: Player;                             // the current player

    constructor(public app: Application) {

        // tilemap
        // let frames = this.getFrames(PIXI.loader.resources, `terrian-01`, [1, 0, 2, 0]);
        // const groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, PIXI.utils.TextureCache['imgs/imgGround.png']);
        // app.stage.addChild(groundTiles);

        // select frames from textures spritesheet for use in this object
        const frames = PixiUtils.getFrames(PIXI.loader.resources, `chicken`, [1, 0, 2, 0]);

        // set up Game Objects
        for (let i = 0; i < 5; i++) {

            // select position the object starts at
              const p = new PIXI.Point(F.ranInt(app.screen.width), F.ranInt(app.screen.height));

              // create the game object and push it to our objs list
              const o: NPC = new NPC(app, frames, p);              // create the game obj (it will add itself to the stage)
              this.objs.push(o);                                        // add the game obj to the list of game objs
              this.container.addChild(o.s);                            // adds the sprite to the stage/world

              // ??
              o.s.interactive = true;  // Touch, pointer and mouse events will be emitted if true
              o.s.buttonMode = true;   // creates hand when hovering over sprite
              o.s.on('pointerdown', onClick.bind(o)); // Pointers normalize touch and mouse
        }

        // ??
        function onClick () {
              const o: GameObj = this;
              o.health = 0;
        }

        // create the player
        this.player = new Player(this.app, frames, F.getCenter(this.app.screen));
        this.objs.push(this.player);
        this.container.addChild(this.player.s);

        // add world container to the stage
        this.app.stage.addChild(this.container);
    }
}
