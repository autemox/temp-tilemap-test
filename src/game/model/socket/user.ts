export interface User {

    id?: number;
    l?: PIXI.Point;        // location actual to be shared with other clients
    v?: PIXI.Point;        // velocity to be shared with other clients
    name?: string;
}
