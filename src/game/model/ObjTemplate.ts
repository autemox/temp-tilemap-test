import { Texture } from 'pixi.js';
import { AnimationTemplate } from './AnimationTemplate';

export interface ObjTemplate {

    name: string;
    sheet?: string;                        // optional, if not specified use name as spritesheet.  do not include .json ending, it is assumed
    animationSpeed: number;
    animations: AnimationTemplate;
    speedX: number;
    speedY: number;
    runModifier: number;                  // the modifier for when object is running
    facingModifier: number;               // the modifier (faster) when object is facing direction of movement
    textures: Array<Texture>;
    scale?: number;
}
