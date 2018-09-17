import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { GameObj } from './world/objs/GameObj';
import { Game } from './Game';
import { Player } from './world/objs/Player';
import { NPC } from './world/objs/NPC';
import { F } from './utils/F';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export class UI {

    // UI
    public pauseGameKey = F.keyboard(27);                    // ESC key
    public pauseMessage: Text = new PIXI.Text('Paused');     // Message to display while game is paused

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
        app.stage.addChild(this.message);

        // allow pausing
        this.pauseMessage.anchor.set(.5);
        this.pauseMessage.position.set(app.screen.width / 2, app.screen.height / 2);
        this.pauseGameKey.press = () => {

            if (game.state === game.play) {
                app.stage.addChild(this.pauseMessage);            // PAUSE THE GAME
                game.state = game.pause;
            }
            else {
                app.stage.removeChild(this.pauseMessage);        // UNPAUSE THE GAME
                game.state = game.play;
            }
        };
    }

    update() {

        const cords = this.game.world.getTileCord(this.game.world.player.x, this.game.world.player.y);
        this.message.text = 'Player Tile Cords: ' + cords.x + ' / ' + cords.y;
    }
}
