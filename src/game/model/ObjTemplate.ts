import { Texture } from 'pixi.js';
import { AnimationTemplate } from './AnimationTemplate';

export interface ObjTemplate {

    name: string;
    sheet?: string;                        // optional, if not specified use name as spritesheet.  do not include .json ending, it is assumed
    animationSpeed: number;
    animations: AnimationTemplate;
    speedX: number;
    speedY: number;
    runModifier: number;
    textures: Array<Texture>;
    scale?: number;
}
