import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { Game } from '../../Game';
import { ObjTemplate } from '../../models/ObjTemplate';
import { PixiUtils } from '../../utils/PixiUtils';

export class GameObj {

    public s: PIXI.extras.AnimatedSprite;          // the PIXI sprite of this game obj
    public v: PIXI.Point = new PIXI.Point(0, 0);   // velocity
    public health: Number = 100;                   // health
    public state: Function = this.alive;           // state (ie alive, dead, dying)
    public type: String = 'obj';                   // npc, player, client, or obj?
    public l: PIXI.Point = new PIXI.Point(0, 0);   // location (actual, not display)
    get x(): number { return this.l.x; }           // x any y variables are based on location actual
    set x(x: number) { this.l.x = x; }
    get y(): number { return this.l.y; }
    set y(y: number) { this.l.y = y; }

    public collision: PIXI.Point = new PIXI.Point(0, 0);   // -1 or 1 for x or y showing collision

    constructor(
        public game: Game,
        public app: Application,
        public objTemplate: ObjTemplate,
        location: Point) {

        const frames = this.getAnimationTextures('walk');
        const s = this.s = new PIXI.extras.AnimatedSprite(frames);

        // set default animated sprite variables
        s.animationSpeed = objTemplate.animationSpeed;
        s.anchor.set(0.5);                                            // center the sprite's rotational anchor point
        s.pivot.set(0.5);                                             // center the sprites x,y pivot point
        s.scale.set(objTemplate.scale);                               // scale sprite bigger
        this.l = s.position = location;                               // set both display position and actual position
        s.position = location;
        if (F.ranBool()) s.scale.x = -objTemplate.scale;              // randomize direction sprite faces at first
    }

    getAnimationTextures(animation): Array<Texture> {

        if (this.objTemplate.animations[animation] === undefined) {
            // tslint:disable-next-line:no-debugger
            debugger;
        }
        return this.objTemplate.animations[animation].map((num) => {             // turn the array of numbers (that represent this animation) into an array of textures
            return this.objTemplate.textures[`${num}.png`];                      // find & return texture
        });
    }

    update(delta) {

        // perform update tasks depending on state ie alive, dying, dead
        this.state();

        // update visual position of game object based on location actual
        this.s.position = this.l;
    }

    dead() {
        const s = this.s;

        // visual
        s.gotoAndStop(1);
        s.rotation = 90;
    }

    alive() {
        const s = this.s;

        // look for future collision
        this.collision = new PIXI.Point(
            this.game.world.mapCollision(this.x + this.v.x + (this.v.x > 0 ? this.s.width : -this.s.width) / 2, this.y) !== 0 ? this.v.x : 0,
            this.game.world.mapCollision(this.x, this.y + this.v.y + (this.v.y > 0 ? this.s.height : -this.s.height) / 2) !== 0 ? this.v.y : 0
        );

        // look for current collsion (bugged)
        if (this.game.world.mapCollision(this.x, this.y)) this.y += 5;

        // physics
        if (!this.collision.x) this.x += this.v.x;
        if (!this.collision.y) this.y += this.v.y;

        // visual
        if (this.v.x === 0 && this.v.y === 0) s.gotoAndStop(1);      // animation
        else if (!s.playing) s.gotoAndPlay(2);
        if (this.v.x !== 0) s.scale.x = this.v.x < 0 ? this.objTemplate.scale : -this.objTemplate.scale;

        // boundaries
        F.boundary(this, new PIXI.Rectangle(0, 0, this.game.world.tile.width * this.game.world.map.width, this.game.world.tile.height * this.game.world.map.height), true);
    }
}
