import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './objs/GameObj';
import { Player } from './objs/Player';
import { NPC } from './objs/NPC';
import { F } from '../utils/F';
import { PixiUtils } from '../utils/PixiUtils';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

interface TileSet {
    firstgid: number;
    source: string;
}

export class World {

    public container = new PIXI.Container();

    public objs: Array<GameObj|Player|NPC> = [];       // Array of World Objects, including Clients and Player
    public player: Player;                             // the current player
    public tilesets: Array<TileSet> = [];            // this relates tiled map to spritesheets with firstgid and source
    public layers = [];

    constructor(public app: Application) {


        // get data from map json
        const mapData: any = PIXI.loader.resources[`assets/map-001.json`].data;

        // prepare list of tilesets from our map json
        this.tilesets = mapData.tilesets.map((tileset) => {
            // fix source string: we just need XXX from ./../XXX-spritesheet.tsx (the way tiled saves the source)
            tileset.source = tileset.source.replace('.tsx', '').replace('-spritesheet', '').replace('/', '').replace('\\', '').replace('.', '').replace('../', '').replace('.../', '');    
            return tileset;
        });

        for (let m = 0; m < mapData.layers.length; m++)
        {
            // tilemap
            const tileSizeX = 32;
            const tileSizeY = 32;
            const groundTiles = new PIXI.tilemap.CompositeRectTileLayer();

            // layer 0
            let c = 0;
            const layerData = mapData.layers[m].data;
            c = 0;
            for (let i = 0; i < mapData.height; i++) {

                for (let j = 0; j < mapData.width; j++, c++) {

                    if (layerData[c] !== 0 && layerData[c] !== undefined)
                    {
                        const sheet: TileSet = getTileSet(this.tilesets, layerData[c]);
                        const texture: Texture = PixiUtils.getFrame(PIXI.loader.resources, sheet.source, layerData[c] - sheet.firstgid);
                        groundTiles.addFrame(texture, j * tileSizeX, i * tileSizeY);
                    }
                }
            }
            app.stage.addChild(groundTiles);
            this.layers.push(groundTiles);
        }

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

        // add filter to entire world
        this.app.stage.filters = [
            new PIXI.filters.GodrayFilter()
        ];

        // set minimize stage size using an empty sprite
        const texture: Texture = PIXI.loader.resources['assets/images/chicken-spritesheet.json'].textures['chicken-0.png'];
        const defStage = new PIXI.Sprite(texture);
        defStage.position.set(800, 600);
        app.stage.addChild(defStage);

        function getTileSet(tilesets: Array<TileSet>, mapTile: number): TileSet {
            // iterate through sheets until we find the correct source of the tile
            let sheet: TileSet;
            for (let i = 0; i < tilesets.length; i ++ ) {
                const tileset: TileSet = tilesets[i];
                if (mapTile > tileset.firstgid) sheet = tileset;
                else return sheet;
            }
            return sheet;
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
