import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point } from 'pixi.js';
import { F } from '../../utils/F';
import { Game } from '../../Game';
import { ObjTemplate } from '../../model/ObjTemplate';
import { PixiUtils } from '../../utils/PixiUtils';
import { Direction } from '../../model/basic/Direction';
import { getPreviousOrParentNode } from '../../../../node_modules/@angular/core/src/render3/instructions';
import { renderComponent } from '../../../../node_modules/@angular/core/src/render3';

export class GameObj {
    // ABOUT THIS CLASS
    // this is a standard game object, can be extended to npc or client, or it can be called directly
    // controls physics of the game object
    // controls visual of the game object, including setting animation & facing (direction)
    // controls

    // game
    public health: Number = 100;                   // health
    public state: Function = this.alive;           // state (ie alive, dead, dying)

    // visual
    public s: PIXI.extras.AnimatedSprite;          // the PIXI sprite of this game obj
    public quiver = 0;                             // set this to non-zero (or set rotation to non-zero) to make the object 'quiver' and make it more noticable
    public idleCount = 0;                          // when reaches 2 seconds, idle animation will play
    public animation = 'stand';                    // what animation is active? stand walk idle dead
    public _facing: Direction = Direction.LEFT;    // what direction is character facing?
    get facing(): Direction { return this._facing; }

    // physics
    public collisionRectangle: PIXI.Rectangle;        // the boundaries of collision
    public collision: PIXI.Point = new PIXI.Point(0, 0);   // -1 or 1 for x or y showing collision
    public v: PIXI.Point = new PIXI.Point(0, 0);      // velocity
    public l: PIXI.Point = new PIXI.Point(0, 0);      // location (actual, not display)
    get x(): number { return this.l.x; }              // x any y variables are based on location actual
    set x(x: number) { this.l.x = x; }
    get y(): number { return this.l.y; }
    set y(y: number) { this.l.y = y; }

    // debug
    public boundingRectangle = new PIXI.Graphics();  // the boundaries of collision

    // running
    public runCounter = 0;                            // when runCounter > 0 the speed of the object moves faster and counter counts down to 0

    public label: PIXI.Text;

    constructor(
        public game: Game,
        public app: Application,
        public objTemplate: ObjTemplate,
        public type: string,
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
                    (type === 'npc' || type === 'obj' ? objTemplate.name : this.name),
                    new PIXI.TextStyle({
                        fontSize: 30,
                        fill: type === 'npc' ? '#D6EBF2' : 'white',
                        fontFamily: 'Calibri',
                        fontWeight: '400',
                        dropShadow: true,
                        dropShadowColor: '#000000',
                        dropShadowBlur: 5,
                        dropShadowAngle: Math.PI / 6,
                        dropShadowDistance: 1
                    })
                );
        this.label.resolution = 2;
        this.label.position.set(0, - this.s.height * 1.5);
        this.label.anchor.set(0.5);
        this.label.visible = this.game.debugMode;
        this.s.addChild(this.label);

        // initiate collision rectangle based on sprite size
        this.collisionRectangle = new PIXI.Rectangle(-this.s.width * 0.35, -this.s.height * 0.35, this.s.width * 0.7, this.s.height * 0.35);

        // draw that rectangle if needed
        if (game.devMode) {
            this.boundingRectangle.lineStyle(4, 0xFF3300, 1);
            this.boundingRectangle.drawRect(this.collisionRectangle.x, this.collisionRectangle.y, this.collisionRectangle.width, this.collisionRectangle.height);
            this.boundingRectangle.x = 0;
            this.boundingRectangle.y = 0;
            this.boundingRectangle.visible = this.game.debugMode;
            this.s.addChild(this.boundingRectangle);
        }
    }

    // debug mode has been toggled
    public debug() {
        this.boundingRectangle.visible = this.game.debugMode;  // show or hide boundingbox
        this.label.visible = this.game.debugMode;
    }

    face(facing: Direction) {
        this.animate(this.animation, facing);
    }


    animate(animation: string, facing?: Direction) {
        if (facing === undefined) facing = this.facing;                         // default to current facing if not specified by call
        if (this.animation === animation && this.facing === facing) return;

        try {
            // load the frames for animation in and start playing... ie: stand_up walk_down idle death
            if (facing === Direction.LEFT || facing === Direction.RIGHT) this.s.textures = this.getAnimationTextures(animation);
            else this.s.textures = this.getAnimationTextures(animation + (facing === Direction.DOWN ? '_down' : '_up'));
        }
        catch {
            // failure to find animations facing direction specified
            if (animation === 'idle') return;                                        // give up for idle animations

            this.s.textures = this.getAnimationTextures(animation);                  // try without facing that direction
            facing = this.s.scale.x > 0 ? Direction.RIGHT : Direction.LEFT;
        }
        this.s.gotoAndPlay(0);
        this.s.loop = true;
        this.animation = animation;                              // the only place animation is updated
        this._facing = facing;                                   // the only place _facing is updated (trying to update it with facing sends you to this function, animate())
    }

    getAnimationTextures(animation): Array<Texture> {

        if (this.objTemplate.animations[animation] === undefined) {
            throw 'animation not found';
        }
        return this.objTemplate.animations[animation].map((num) => {             // turn the array of numbers (that represent this animation) into an array of textures
            return this.objTemplate.textures[`${num}.png`];                      // find & return texture
        });
    }

    update(delta) {

        // perform update tasks depending on state ie alive, dying, dead
        this.state();

        // update visual position of game object based on location actual
        this.l.x = Math.round(this.l.x * 10) / 10;
        this.l.y = Math.round(this.l.y * 10) / 10;

        // update label based on horizontal flipping of sprite
        this.label.scale.x = this.s.scale.x > 0 ? 1 : -1;
    }

    dead() {
        const s = this.s;

        // visual
        this.animate('dead');
        s.rotation = 90;
    }

    getSpeed(): PIXI.Point {

        // this is called every frame in case of changes to facing or running.  called from Player.ts and GameObj.ts
        return new PIXI.Point(
            (this.runCounter > 0 ? this.objTemplate.runModifier : 1) *                    // adjust for faster movement if runCounter is on
            (this.facing === Direction.LEFT && this.v.x < 0 ? this.objTemplate.facingModifier : 1) *      // adjust for faster movement moving left and facing left
            (this.facing === Direction.RIGHT && this.v.x > 0 ? this.objTemplate.facingModifier : 1) *      // adjust for faster movement moving right and facing right
            this.objTemplate.speedX
        ,
            (this.runCounter > 0 ? this.objTemplate.runModifier : 1) *
            (this.facing === Direction.DOWN && this.v.y > 0 ? this.objTemplate.facingModifier : 1) *
            (this.facing === Direction.UP && this.v.y < 0 ? this.objTemplate.facingModifier : 1) *
            this.objTemplate.speedY);
    }

    EightPointCollision(futureBox): Boolean {                                // check collision with a box using 8 key points on that box

        if (                                                                 // check all 4 corners of a box
            this.game.world.mapCollision(futureBox.x,                       futureBox.y) ||
            this.game.world.mapCollision(futureBox.x + futureBox.width,     futureBox.y) ||
            this.game.world.mapCollision(futureBox.x + futureBox.width,     futureBox.y + futureBox.height) ||
            this.game.world.mapCollision(futureBox.x,                       futureBox.y + futureBox.height)) {

            return true;
        }

        if (this.game.world.tile.width > futureBox.width &&
            this.game.world.tile.height > futureBox.height) return false;    // for sprites smaller than a tile we are done


        if (                                                                // for sprites larger than a tile, need to check intermediate points: top center, bottom center, left center, right center
            this.game.world.mapCollision(futureBox.x + futureBox.width / 2, futureBox.y) ||
            this.game.world.mapCollision(futureBox.x + futureBox.width,     futureBox.y + futureBox.width / 2) ||
            this.game.world.mapCollision(futureBox.x + futureBox.width / 2, futureBox.y + futureBox.height) ||
            this.game.world.mapCollision(futureBox.x,                       futureBox.y + futureBox.height / 2)) {

            return true;
        }

        return false;
    }

    alive() {
        const s = this.s;

        // look for collision
        const box = new PIXI.Rectangle(                                  // this is a box that represents the game objects location
            this.collisionRectangle.left + this.x,
            this.collisionRectangle.top + this.y,
            this.collisionRectangle.width,
            this.collisionRectangle.height);

        let futureBox = new PIXI.Rectangle(box.x + this.v.x, box.y, box.width, box.height);                // check horizontal collision (if only vx is applied to box)
        if (this.EightPointCollision(futureBox)) this.collision.x = this.v.x = 0;                    // going to collide horizontally

        futureBox = new PIXI.Rectangle(box.x + this.v.x, box.y + this.v.y, box.width, box.height);   // check diagnol collision (if both vx and vy are applied to box) - note we don't just apply vy only because sometimes diagnol movement causes collision that wouldnt be detected with vx or vy individually ie coming at the tile's corner at a diagnol
        if (this.EightPointCollision(futureBox)) this.collision.y = this.v.y = 0;                    // going to collide vertically/diagnolly.  note that this.collision is a point that turns to 1 in the x or y direction if there is a collision in the x or y direction

        // look for glitch / character stuck in wall
        futureBox = new PIXI.Rectangle(box.x, box.y, box.width, box.height);                         // check for current collision (IF GAME IS BUGGED OUT) and move character downward until it is gone
        if (this.EightPointCollision(futureBox)) {

                this.y += 5;
        }

        // physics
        if (!this.collision.x) this.x += this.v.x;                       // move actual
        if (!this.collision.y) this.y += this.v.y;

        // calculate local velocity and move towards location actual
        const speed = this.getSpeed();                                   // gets the game obj maximum speed according to base speed, the direction they are facing, and whether they are running
        const v = new PIXI.Point(                                        // note local velocity is different than actual velocity and exists to prevent rubber banding
            this.x > s.x + speed.x ? speed.x :                           // select local velocity based on which direction they need to move to get to location actual
            this.x < s.x - speed.x ? -speed.x :
            this.v.x,
            this.y > s.y + speed.y ? speed.y :
            this.y < s.y - speed.y ? -speed.y :
            this.v.y);

        if (!this.collision.x) s.x += v.x;                               // move towards location actual
        else s.x = (s.x * 90 + this.x * 10) / 100;
        if (!this.collision.y) s.y += v.y;
        else s.y = (s.y * 90 + this.y * 10) / 100;

        // boundaries
        F.boundary(this, new PIXI.Rectangle(0, 0, this.game.world.tile.width * this.game.world.map.width, this.game.world.tile.height * this.game.world.map.height), true);

        // change facing direction
        if (this.id === this.game.world.player.id || F.distanceBetween(this.l, s.position) > 10) {   // only if far from location actual or this is actual player, that way other clients dont spaz out looking left and right repeatedly

            if (v.x === 0 && v.y < 0 || v.y < 0 && this.facing === Direction.DOWN) this.animate(this.animation,
                Direction.UP);
            else if (v.x === 0 && v.y > 0 || v.y > 0 && this.facing === Direction.UP) this.animate(this.animation,
                Direction.DOWN);
            else if (v.x !== 0 && v.y === 0) this.animate(this.animation,
                this.v.x > 0 ? Direction.RIGHT :                                                     // checks for left and right movement and returns which direction they are facing.  if not moving left or right, returns current direction
                this.v.x < 0 ? Direction.LEFT :
                this.facing);
        }

        // change animation
        if (v.x !== 0 || v.y !== 0) this.animate('walk');                                                    // visual based on local velocity (not actual velocity), this makes it prettier
        else if (this.animation !== 'idle' && this.animation !== 'stand') this.animate('stand');

        // flip horizontally (scale.x) for facing right
        if (this.facing === Direction.RIGHT) s.scale.x = -this.objTemplate.scale;                // flip image only if facing right
        else s.scale.x = this.objTemplate.scale;                                                 // all other directions we do not flip image

        // objects that have rotation should quiver to make them more noticable
        this.quiver += s.rotation / 15;
        s.rotation -= this.quiver / 10;

        // countdown to idle animation
        if (v.x !== 0 || v.y !== 0) this.idleCount = 0;
        else this.idleCount++;

        // execute idle animation
        if (this.idleCount === 2 * 60)
        {
            this.animate('idle');
            s.loop = false;
            s.onComplete = function () {                                                        // after idle animation is complete, go back to standing
                this.animate('stand');
                this.idleCount = -2 * 60;
            }.bind(this);
        }
    }

    remove() {

        // removes game object from world
        this.game.world.objs = this.game.world.objs.filter((o: any) => {
            return o === this ? false : true;
        });

        // removes sprite from container
        this.game.world.spriteContainer.removeChild(this.s);
    }

    onMouseOver() {

        this.label.visible = true;
        console.log('over!', this);
    }

    onMouseOut() {

        if (!this.game.debugMode) this.label.visible = false;
    }

    onClick() {

    }
}
