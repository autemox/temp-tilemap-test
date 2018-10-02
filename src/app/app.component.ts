import { Component, OnInit, ViewChild } from '@angular/core';
import { Application } from 'pixi.js';
declare var PIXI: any; // instead of importing pixi like some tutorials say to do use declare
import { Game } from '../game/Game';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faBtc } from '@fortawesome/fontawesome-free-brands';

@Component({
  selector: 'app-root',                   // app-root is what is called to in our index.html file with <app-root></app-root>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('pixiContainer') pixiContainer;         // reference to <div> that contains our pixi application
    @ViewChild('editorContainer') editorContainer;     // reference to <div> that contains our pixi application
    public app: Application;                           // Pixi Application
    public editor: Application;                           // Pixi Application
    public game: Game;
    faBolt = faBolt;
    faBtc = faBtc;
    faDollarSign = faDollarSign;

    ngOnInit() {

        this.startGame();
    }

    startGame() {
        // create the pixi application
        this.app = new PIXI.Application({
            autoResize: true,
            resolution: devicePixelRatio,
            backgroundColor: 0x1099bb
        });


        document.querySelector('#pixiContainer').appendChild(this.app.view);

        // autoresize pixi canvas
        window.addEventListener('resize', this.resize.bind(this));                             // Listen for window resize events
        this.resize();

        // start the game
        this.game = Game.getInstance(this.app);
    }

    resize() {                                                    // Resize function window

        const parent: HTMLElement = document.querySelector('#pixiContainer');                           // Get the p
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight); // Resize the renderer
    }
}
