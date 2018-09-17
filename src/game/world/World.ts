import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './objs/GameObj';
import { Player } from './objs/Player';
import { NPC } from './objs/NPC';
import { Game } from './../Game';
import { F } from '../utils/F';
import { PixiUtils } from '../utils/PixiUtils';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

interface TileSet {
    firstgid: number;
    source: string;
}

interface Layer {
    name: string;
    data: Array<number>;
    pixiTileMap: any;
}

export class World {

    public container = new PIXI.Container();

    public objs: Array<GameObj|Player|NPC> = [];       // Array of World Objects, including Clients and Player
    public player: Player;                             // the current player
    public tilesets: Array<TileSet> = [];              // this relates tiled map to spritesheets with firstgid and source

    public map: Rectangle;                                     // contains width and height of map, in tiles (not pixels)
    public tile: Rectangle = new PIXI.Rectangle(0, 0, 32, 32); // width and height of tile (in pixels)
    public layers: Array<Layer> = [];

    constructor(
        public game: Game,
        public app: Application) {

        // get data from map json
        const mapData: any = PIXI.loader.resources[`assets/map-001.json`].data;

        // save information about our map
        this.map = new PIXI.Rectangle(0, 0, mapData.width, mapData.height);

        // prepare list of tilesets from our map json
        this.tilesets = mapData.tilesets.map((tileset) => {
            // fix source string: we just need XXX from ./../XXX-spritesheet.tsx (the way tiled saves the source)
            tileset.source = tileset.source.replace('.tsx', '').replace('-spritesheet', '').replace('/', '').replace('\\', '').replace('.', '').replace('../', '').replace('.../', '');    
            return tileset;
        });

        for (let m = 0; m < mapData.layers.length; m++)
        {
            // process terrian layer
            let c = 0;
            const layer: Layer = {
                name: mapData.layers[m].name,
                data: mapData.layers[m].data,
                pixiTileMap: new PIXI.tilemap.CompositeRectTileLayer()
            };

            // process collision layer
            if (layer.name === 'collision') layer.pixiTileMap.visible = false;        // hide layers labeled collision

            // process visible layer
            c = 0;
            for (let i = 0; i < mapData.height; i++) {

                for (let j = 0; j < mapData.width; j++, c++) {

                    if (layer.data[c] !== 0 && layer.data[c] !== undefined)
                    {
                        const sheet: TileSet = getTileSet(this.tilesets, layer.data[c]);
                        const text: Texture = PixiUtils.getFrame(PIXI.loader.resources, sheet.source, layer.data[c] - sheet.firstgid);
                        layer.pixiTileMap.addFrame(text, j * this.tile.width, i * this.tile.height);
                    }
                }
            }

            this.layers.push(layer);                      // add layer to layer list
        }

        // add background terrian to map
        for (let m = 0; m < this.layers.length; m++){
            if (this.layers[m].name !== 'foreground') app.stage.addChild(this.layers[m].pixiTileMap);
        }

        // select frames from textures spritesheet for use in this object
        const frames = PixiUtils.getFrames(PIXI.loader.resources, `chicken`, [1, 0, 2, 0]);

        // set up Game Objects
        for (let i = 0; i < 5; i++) {

            // select position the object starts at
              const p = new PIXI.Point(F.ranInt(app.screen.width), F.ranInt(app.screen.height));

              // create the game object and push it to our objs list
              const o: NPC = new NPC(game, app, frames, p);              // create the game obj (it will add itself to the stage)
              this.objs.push(o);                                        // add the game obj to the list of game objs
              this.container.addChild(o.s);                            // adds the sprite to the stage/world

              // ??
              o.s.interactive = true;  // Touch, pointer and mouse events will be emitted if true
              o.s.buttonMode = true;   // creates hand when hovering over sprite
              o.s.on('pointerdown', onClick.bind(o)); // Pointers normalize touch and mouse
        }

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
        this.player = new Player(this.game, this.app, frames, F.getCenter(this.app.screen));
        this.objs.push(this.player);
        this.container.addChild(this.player.s);

        // add sprite container to the stage
        this.app.stage.addChild(this.container);

        // add foreground layers
        for (let m = 0; m < this.layers.length; m++){
            if (this.layers[m].name === 'foreground') app.stage.addChild(this.layers[m].pixiTileMap);
        }
    }

    public mapCollision(x, y): number {                   // put in x, y in pixels, returns 0 if no collision with collision layer, or a single # representing the texture collided with

        const tileCords = this.getTileCord(x, y);
        const tileElement = this.getTileElement(tileCords);
        return this.getLayer('collision').data[tileElement];
    }

    public getLayer(name: string): Layer {                 // returns the layer specified by name
        for (let i = 0; i < this.layers.length; i++)
        {
            if (this.layers[i].name === name) return this.layers[i];
        }
    }

    public getTileElement(tileCord: Point): number {         // returns the single number representing a location on the tile map (not in pixels)

        return tileCord.x + tileCord.y * this.map.width;
    }

    public getTileCord(x, y /*in pixels*/): PIXI.Point {        // returns 2 numbers representing a location on the tile map (not in pixels)
        return new PIXI.Point(Math.floor(x / this.tile.width), Math.floor(y / this.tile.height));
    }
}
