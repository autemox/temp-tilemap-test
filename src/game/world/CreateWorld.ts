import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './objs/GameObj';
import { Player } from './objs/Player';
import { NPC } from './objs/NPC';
import { F } from '../utils/F';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class CreateWorld {

    constructor(public app: Application, public world: Container, public objs: any, public player: Player) {

        // select frames from textures spritesheet for use in this object
        const frames = this.getFrames(PIXI.loader.resources, `chicken`, [1, 0, 2, 0]);

        // set up Game Objects
        for (let i = 0; i < 5; i++) {

            // select position the object starts at
              const p = new PIXI.Point(F.ranInt(app.screen.width), F.ranInt(app.screen.height));

              // create the game object and push it to our objs list
              const o: NPC = new NPC(app, frames, p);              // create the game obj (it will add itself to the stage)
              objs.push(o);                                        // add the game obj to the list of game objs
              this.world.addChild(o.s);                            // adds the sprite to the stage/world

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

        // create player
        this.player = new Player(this.app, frames, F.getCenter(this.app.screen));
        this.objs.push(this.player);
        this.world.addChild(this.player.s);

        // add sprites container to the stage
        this.app.stage.addChild(this.world);
    }

    getFrames(resources: Array<PIXI.loaders.Resource>, spritesheet: string, frameNumbers: Array<Number>): Array<Texture>
    {
        const textures: Array<Texture> = resources[`assets/images/${spritesheet}-spritesheet.json`].textures;
        const frameNum: Array<Number> = [1, 0, 2, 0];                     // textures to use (we will use frame 0 twice because its the 'intermediary' frame in the walking animation)
        const frames: Array<Texture> = frameNum.map((num) => {            // turn the array of numbers into an array of textures
            return textures[`sprite-${num}.png`];                        // find & return texture
        });
        return frames;
    }
}
