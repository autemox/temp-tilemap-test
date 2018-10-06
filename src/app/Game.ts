import { Application } from 'pixi.js';
declare var PIXI: any;                                         // instead of importing pixi like some tutorials say to do use declare b/c we are on angular 6

export class Game {

    app: PIXI.Application;                               // declare the pixi application

    constructor() {

        this.app = new PIXI.Application({backgroundColor: 0x1099bb});     // create the pixi application
        PIXI.loader.add([                                                 // load assets
            'assets/images/terrian-01.json',                              // asset list
            'assets/images/benjiro-01.json'
        ])
            .load(this.loaded.bind(this));                                // loaded() runs after assets are loaded
    }

   loaded() {

        const tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, []);  // can pass textures to this array in second argument, if I do, it does not help anything, but similar results: whichever texture is passed first will appear.  the other texture will not.

        tilemap.addFrame(PIXI.loader.resources['assets/images/terrian-01.json'].textures['terrian-01-287.png'], 64, 0); // a large sign.             will load because it is the first spritesheet to be called with addFrame()
        tilemap.addFrame(PIXI.loader.resources['assets/images/benjiro-01.json'].textures['benjiro-01-181.png'], 0, 0);  // a log with an axe in it.  will not load unless you put this line up one line higher
        tilemap.addFrame(PIXI.loader.resources['assets/images/terrian-01.json'].textures['terrian-01-286.png'], 128, 0); // a small sign.            will load because it is on the same spritesheet as the large sign and it was the first spritesheet to be called

        this.app.stage.addChild(tilemap);
   }
}
