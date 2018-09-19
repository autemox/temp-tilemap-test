import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { Game } from '../../Game';
import { ObjTemplate } from '../../model/ObjTemplate';
import { PixiUtils } from '../../utils/PixiUtils';

export class GameObj {

    // game
    public health: Number = 100;                   // health
    public state: Function = this.alive;           // state (ie alive, dead, dying)
    public type: String = 'obj';                   // npc, player, client, or obj?

    // visual
    public s: PIXI.extras.AnimatedSprite;          // the PIXI sprite of this game obj
    public quiver = 0;                             // set this to non-zero (or set rotation to non-zero) to make the object 'quiver' and make it more noticable
    public idleCount = 0;                          // when reaches 2 seconds, idle animation will play
    public animation = 'stand';                    // what animation is active? stand walk idle dead

    // physics
    public collision: PIXI.Point = new PIXI.Point(0, 0);   // -1 or 1 for x or y showing collision
    public v: PIXI.Point = new PIXI.Point(0, 0);   // velocity
    public l: PIXI.Point = new PIXI.Point(0, 0);   // location (actual, not display)
    get x(): number { return this.l.x; }           // x any y variables are based on location actual
    set x(x: number) { this.l.x = x; }
    get y(): number { return this.l.y; }
    set y(y: number) { this.l.y = y; }

    public label: PIXI.Text;

    constructor(
        public game: Game,
        public app: Application,
        public objTemplate: ObjTemplate,
        location: Point,
        public id: number,
        public name: string) {

        const s = this.s = new PIXI.extras.AnimatedSprite(this.getAnimationTextures('stand'));

        // set default animated sprite variables
        s.animationSpeed = objTemplate.animationSpeed;
        s.anchor.set(.45, 1);                                            // center the sprite's rotational anchor point
        s.pivot.set(0.5);                                             // center the sprites x,y pivot point
        s.scale.set(objTemplate.scale);                               // scale sprite bigger
        this.l = s.position = location;                               // set both display position and actual position
        s.position = location;
        if (F.ranBool()) s.scale.x = -objTemplate.scale;              // randomize direction sprite faces at first

        // label above the object
                this.label = new PIXI.Text(
                    this.name,
                    new PIXI.TextStyle({
                        fontSize: 40,
                        fill: 'white'
                    })
                );
        this.label.position.set(-this.label.width / 2, - this.s.height * 2);
        this.s.addChild(this.label);
    }

    animate(animation: string) {
        if (this.animation === animation) return;

        // load the frames for animation in and start playing... ie: stand walk idle death
        this.s.textures = this.getAnimationTextures(animation);
        this.s.gotoAndPlay(0);
        this.s.loop = true;
        this.animation = animation;
    }

    getAnimationTextures(animation): Array<Texture> {

        if (this.objTemplate.animations[animation] === undefined) {
            // tslint:disable-next-line:no-debugger
        }
        return this.objTemplate.animations[animation].map((num) => {             // turn the array of numbers (that represent this animation) into an array of textures
            return this.objTemplate.textures[`${num}.png`];                      // find & return texture
        });
    }

    update(delta) {

        // perform update tasks depending on state ie alive, dying, dead
        this.state();

        // update visual position of game object based on location actual
        this.l.x = Math.round(this.l.x);
        this.l.y = Math.round(this.l.y);
        this.s.position.x = (this.s.position.x * 90 + this.l.x * 10) / 100;
        this.s.position.y = (this.s.position.y * 90 + this.l.y * 10) / 100;
    }

    dead() {
        const s = this.s;

        // visual
        this.animate('dead');
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
        if (!this.collision.x) this.x += this.v.x;                       // move actual
        if (!this.collision.y) this.y += this.v.y;
        if (!this.collision.x) this.s.position.x += this.v.x;            // move visual
        if (!this.collision.y) this.s.position.y += this.v.y;

        // boundaries
        F.boundary(this, new PIXI.Rectangle(0, 0, this.game.world.tile.width * this.game.world.map.width, this.game.world.tile.height * this.game.world.map.height), true);

        // visual
        if (this.v.x !== 0 || this.v.y !== 0) this.animate('walk');
        else if (this.animation !== 'idle') this.animate('stand');
        if (this.v.x !== 0) s.scale.x = this.v.x < 0 ? this.objTemplate.scale : -this.objTemplate.scale;

        // objects that have rotation should quiver to make them more noticable
        this.quiver += this.s.rotation / 15;
        this.s.rotation -= this.quiver / 10;

        // countdown to idle animation
        if (this.v.x !== 0 || this.v.y !== 0) this.idleCount = 0;
        else this.idleCount++;

        if (this.idleCount === 2 * 60)
        {
            this.animate('idle');
            this.s.loop = false;
            this.s.onComplete = function () {
                this.animate('stand');
                this.idleCount = -2 * 60;
            }.bind(this);
        }
    }

    remove() {

        // removes game object from world
        this.game.world.objs.filter((o: any) => {
            if (o === this) return false;
            return true;
        });

        // removes sprite from container
        this.game.world.container.removeChild(this.s);
    }
}
