import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Game } from './Game';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
import { debug } from 'util';
import { Layer } from './model/Layer';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class UI {

    // UI
    public debugKey = F.keyboard(27);                    // ESC key

    // debugging
    public message: PIXI.Text;                               // Message to display in top left corner (for debugging)

    constructor(public game: Game) {

        const app = game.app;

        // initiate the debug message
        this.message = new PIXI.Text(
            '(debug)',
            new PIXI.TextStyle({
                wordWrap: true,
                wordWrapWidth: 100,
                fontSize: 12,
                fill: 'white'
            })
        );
        this.message.position.set(2, 2);
        this.message.visible = this.game.debugMode;
        app.stage.addChild(this.message);

        // allow debugging
        this.debugKey.press = function() {

            this.game.debugMode = !this.game.debugMode;    // toggle debug
            this.message.visible = this.game.debugMode;    // show or hide top left corner text
            for (let i = 0, len = this.game.world.objs.length; i < len; i++) this.game.world.objs[i].debug();  // loop through game objects and update them

            for (let m = 0, len = this.game.world.layers.length; m < len; m++)        // loop through layers and change collision layers to visible or not
            {
                const layer: Layer = this.game.world.layers[m];
                console.log(layer);
                if (layer.name === 'collision') layer.pixiTileMap.visible = this.game.debugMode;
            }
        }.bind(this);
    }

    update() {

        const cords = this.game.app.renderer.plugins.interaction.mouse.global;
        this.message.text = this.game.connection.status;
    }
}
