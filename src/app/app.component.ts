import { Component, OnInit, ViewChild } from '@angular/core';
declare var PIXI: any;
import { Game } from './Game';

@Component({
  selector: 'app-root',                   // app-root is what is called to in our index.html file with <app-root></app-root>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('pixiContainer') pixiContainer;         // reference to <div> that contains our pixi application

    ngOnInit() {

        const game = new Game();                                                       // start the game
        document.querySelector('#pixiContainer').appendChild(game.app.view);                   // add pixi application to viewable screen

    }
}
