import { Component, OnInit, ViewChild } from '@angular/core';
import { Sprite, Application, Rectangle } from 'pixi.js';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare

@Component({
  selector: 'app-root',                   // app-root is what is called to in our index.html file with <app-root></app-root>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('pixiContainer') pixiContainer; // this allows us to reference and load stuff into the div container

  name = 'Max';
  public app: Application;

  ngOnInit() {

    this.app = new PIXI.Application({ // this creates our pixi application
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb
    });
    this.pixiContainer.nativeElement.appendChild(this.app.view);


    PIXI.loader
      .add([
        'assets/images/chicken.png',  // load sprite textures
        'assets/images/chicken-spritesheet.png'
      ])
    .on('progress', this.loadProgressHandler)
    .load(this.setup.bind(this));
  }

  loadProgressHandler(loader, resource) {
    console.log(`loaded ${resource.url}. Loading is ${loader.progress}% complete.`);
  }

  setup() {                     // runs when textures are done loading
    console.log(`loading complete.`);

    // prepare the spritesheet
    // const texture = PIXI.utils.TextureCache['assets/images/chicken-spritesheet.png'];  // Create the `tileset` sprite from the texture
    // const rectangle: Rectangle = new Rectangle(0, 0, 16, 16); // Create a rectangle object that defines the position and size of the sub-image you want to extract from the texture
    // texture.frame = rectangle;  // Tell the texture to use that rectangular section

    // Create the sprite from the texture
    // const bunny = new Sprite(texture);


  }

  ranInt(min: number, max: number) {
    return Math.round((Math.random() * (max - min) + min));
  }
}
