
import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { ProtractorExpectedConditions } from 'protractor';
import { Game } from '../Game';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export module PixiUtils {

    export function getFrames(resources: Array<PIXI.loaders.Resource>, spritesheet: string, frameNumbers: Array<Number>): Array<Texture>
    {
        // tslint:disable-next-line:no-inferrable-types
        const file: string = `assets/images/${spritesheet}-spritesheet.json`;
        const textures: Array<Texture> = resources[file].textures;
        const frames: Array<Texture> = frameNumbers.map((num) => {            // turn the array of numbers into an array of textures
            return textures[`${num}.png`];                                    // find & return texture
        });
        return frames;
    }

    export function getFrame(resources, spritesheet, frameNumber: Number): Texture {
        return getFrames(resources, spritesheet, [frameNumber])[0];
    }
}
