import { Texture } from 'pixi.js';
import { AnimationTemplate } from './AnimationTemplate';

export interface ObjTemplate {

    name: string;
    animationSpeed: number;
    animations: AnimationTemplate;
    speedX: number;
    speedY: number;
    runModifier: number;
    textures: Array<Texture>;
    scale?: number;
}
