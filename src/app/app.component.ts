import { Component, OnInit, ViewChild } from '@angular/core';
import { Application } from 'pixi.js';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare
import { Game } from '../game/Game';

@Component({
  selector: 'app-root',                   // app-root is what is called to in our index.html file with <app-root></app-root>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('pixiContainer') pixiContainer;         // reference to <div> that contains our pixi application
    public app: Application;                           // Pixi Application
    public game: Game;

    ngOnInit() {

        // create the pixi application
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1099bb
        });

        // display the pixi app on our specified <div> container
        this.pixiContainer.nativeElement.appendChild(this.app.view);

        // start the game
        this.game = new Game(this.app);
    }
}
