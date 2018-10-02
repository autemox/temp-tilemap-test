export interface User {

    // ABOUT THIS INTERFACE
    // this represents the user data that is sent back and forth between clients and server
    // this data both identifies the client (esp id) and helps update on what the client is doing (location, etc)

    // RELEVANT FUNCTIONS (UPDATE THESE TO ADD MORE VARIABLES TO INTERFACE)
    // User.var is set in Connection.ts updateUser()
    // User.var is applied to Client object in Connection.ts updateClient()

    id?: number;
    template?: string;     // the object template in string form ie 'human', 'chicken', 'chick'
    l?: PIXI.Point;        // location actual to be shared with other clients
    v?: PIXI.Point;        // velocity to be shared with other clients
    scaleX?: number;       // what direction are they facing?
    name?: string;
}
