import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './objs/GameObj';
import { Player } from './objs/Player';
import { NPC } from './objs/NPC';
import { Game } from './../Game';
import { F } from '../utils/F';
import { PixiUtils } from '../utils/PixiUtils';
import { AnimationTemplate } from './../models/AnimationTemplate';
import { ObjTemplate } from './../models/ObjTemplate';
import { TileSet } from './../models/TileSet';
import { Layer } from './../models/Layer';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare


// ABOUT THIS CLASS
// contains the game world, a map, tilesets, terrian, a container with all game sprites in it, a reference to the player object
export class World {

    public container = new PIXI.Container();                        // contains all game sprites
    public objs: Array<GameObj|Player|NPC> = [];                    // Array of World Objects, including Clients, Player, NPCs
    public player: Player;                                          // the current player object

    public tilesets: Array<TileSet> = [];                           // list of tilesets linked to this map

    public mapName: string;                                         // the name of our map ie map-001
    public map: Rectangle;                                          // a rectangle with the width and height of the map, in tiles (not pixels)
    public tile: Rectangle = new PIXI.Rectangle(0, 0, 64, 64);      // width and height of a single tile (in pixels)
    public layers: Array<Layer> = [];                               // a list of terrian layers, their name, data (array of numbers representing the tile), and the pixiTileMap (composed image)

    constructor(public game: Game, public app: Application, mapName: string) {

        // iterate loaded spritesheets
        game.templates.Keys().forEach((key) => {

            const o: ObjTemplate = game.templates.Item(key);
            const file = `assets/images/${o.name}.json`;                           // the location of the objects sprite png
            o.textures = PIXI.loader.resources[file].textures;                  // load all objects textures into its objectTemplate so that object can access them
            console.log(`added ${o.name} to textures.`);
        });

        const mapData: any = PIXI.loader.resources[`assets/${mapName}.json`].data; // get map data from map json
        this.mapName = mapName;                                                    // save information about our map
        this.map = new PIXI.Rectangle(0, 0, mapData.width, mapData.height);        // remember map height and width (in tiles)

        this.tilesets = mapData.tilesets.map((tileset) => {        // prepare list of tilesets from our json list of tilesets
            return {
                firstgid: tileset.firstgid,
                source: F.removeExtension(F.removePath(tileset.source)) // fix source string: we just need XXX from ./../XXX-spritesheet.tsx (the way tiled saves the source)
            };
        });

        // iterate map data
        for (let m = 0; m < mapData.layers.length; m++)
        {
            // create terrian layers
            const layer: Layer = {                                                    // new layer
                name: mapData.layers[m].name,
                data: mapData.layers[m].data,
                pixiTileMap: new PIXI.tilemap.CompositeRectTileLayer()
            };
            this.layers.push(layer);                                                  // add layer to layer list

            switch (layer.name) {

                case 'collision': {

                    // process collision layer
                    layer.pixiTileMap.visible = false;                                    // hide layers labeled collision
                    break;
                }
                case 'objects': {

                    // process object layer
                    for (let i = 0; i < mapData.layers[m].objects.length; i++) {                // create game objects

                        const objData = mapData.layers[m].objects[i];                                          // the data about this object from our map json
                        // tslint:disable-next-line:no-inferrable-types
                        const p = new PIXI.Point(objData.x, objData.y);                                        // select position the object starts at

                        this.addObject(objData.name, objData.type.toLowerCase(), p);                           // create the object
                    }
                    this.app.stage.addChild(this.container);                             // add sprite container to the stage
                    break;
                }
                default: {

                    // process visible layer
                    let c = 0;
                    for (let i = 0; i < mapData.height; i++) {

                        for (let j = 0; j < mapData.width; j++, c++) {

                            if (layer.data[c] !== 0 && layer.data[c] !== undefined)
                            {
                                const sheet: TileSet = this.getTileSet(this.tilesets, layer.data[c]);
                                const text: Texture = PixiUtils.getFrame(PIXI.loader.resources, sheet.source, layer.data[c] - sheet.firstgid);
                                layer.pixiTileMap.addFrame(text, j * this.tile.width, i * this.tile.height);
                            }
                        }
                    }
                    app.stage.addChild(this.layers[m].pixiTileMap);
                    break;
                }
            }
        }

        // set minimize stage size using an empty sprite
        const texture: Texture = PIXI.loader.resources['assets/images/chicken.json'].textures['0.png'];
        const defStage = new PIXI.Sprite(texture);
        defStage.position.set(this.map.width * this.tile.width, this.map.height * this.tile.height);
        app.stage.addChild(defStage);

    }

    public addObject(name: string, type: string, p) {

        // find the template for this object
        const objTemplate: ObjTemplate = this.game.templates.Item(name);

        // create the game object
        let o: any;
        if (type === 'npc') o = new NPC(this.game, this.app, objTemplate, p);
        else if (type === 'player') o = this.player = new Player(this.game, this.app, objTemplate, p);
        else  o = new GameObj(this.game, this.app, objTemplate, p);

        // add game object to obj list and sprite to sprite container
        this.objs.push(o);
        this.container.addChild(o.s);

        // allow chickens to be clicked
        if (o.type === 'npc' && name === 'chicken') {
            o.s.interactive = true;                                          // Touch, pointer and mouse events will be emitted if true
            o.s.buttonMode = true;                                           // creates hand when hovering over sprite
            o.s.on('pointerdown', o.onClick.bind(o));                          // Pointers normalize touch and mouse
        }

        return o;
    }

    public getTileSet(tilesets: Array<TileSet>, mapTile: number): TileSet {
        // iterate through sheets until we find the correct source of the tile
        let sheet: TileSet;
        for (let i = 0; i < tilesets.length; i ++ ) {
            const tileset: TileSet = tilesets[i];
            if (mapTile > tileset.firstgid) sheet = tileset;
            else return sheet;
        }
        return sheet;
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
