
import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, Point, TextStyle } from 'pixi.js';
import { ProtractorExpectedConditions } from 'protractor';
import { Game } from '../Game';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

export module PixiUtils {

    // given all resources and string and frame numbers that we want, we must return selected frames from selected spritesheet
    export function getFrames(resources: Array<PIXI.loaders.Resource>, spritesheet: string, frameNumbers?: Array<Number>): Array<Texture>
    {
        // tslint:disable-next-line:no-inferrable-types
        const file: string = `assets/images/${spritesheet}.json`;
        if (resources[file]) {

            // gather textures from specified spritesheet
            const textures: Array<Texture> = resources[file].textures;
            if (!frameNumbers) return textures;                                   // if no frame numbers were selected, send all frames

            // sort out textures that are actually needed
            const frames: Array<Texture> = frameNumbers.map((num) => {            // turn the array of numbers into an array of textures
                return textures[`${num}.png`];                                    // find & return texture
            });
            return frames;
        }
        else {
            console.log('unable to retrieve spritesheet');                        // something is wrong with the spritesheet specified/doesnt exist
            // tslint:disable-next-line:no-debugger
            debugger;
            return undefined;
        }
    }

    // given all resources we must get specific frame from specific spritesheet
    export function getFrame(resources, spritesheet: string, frameNumber: Number): Texture {

        return getFrames(resources, spritesheet, [frameNumber])[0];
    }
}
