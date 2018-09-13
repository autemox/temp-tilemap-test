
import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export module PixiUtils {

    export function getFrames(resources: Array<PIXI.loaders.Resource>, spritesheet: string, frameNumbers: Array<Number>): Array<Texture>
    {
        const textures: Array<Texture> = resources[`assets/images/${spritesheet}-spritesheet.json`].textures;
        const frameNum: Array<Number> = [1, 0, 2, 0];                     // textures to use (we will use frame 0 twice because its the 'intermediary' frame in the walking animation)
        const frames: Array<Texture> = frameNum.map((num) => {            // turn the array of numbers into an array of textures
            return textures[`sprite-${num}.png`];                        // find & return texture
        });
        return frames;
    }
}
