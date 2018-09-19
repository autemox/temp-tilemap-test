import { Component, OnInit, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver'; // Don't forget to import the file-saver

@Component({
  selector: 'app-json-generator',
  templateUrl: './json-generator.component.html',
  styleUrls: ['./json-generator.component.css']
})
export class JsonGeneratorComponent implements OnInit {

    @ViewChild('tileWidth') tileWidth;
    @ViewChild('tileHeight') tileHeight;

    constructor() { }

    ngOnInit() {
    }

    fileChange(event) {

        // let user select a file
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {

            // user selected a file
            const file: File = fileList[0];
            console.log('file: ', file.name);

            // look at file as an image
            const img = new Image;
            img.src = URL.createObjectURL(file);
            img.onload = () => {

                // check user input for tile w/h
                const tileWidth = this.tileWidth.nativeElement.value;
                const tileHeight = this.tileHeight.nativeElement.value;
                console.log('height and width: ', img.height, tileHeight, img.width, tileWidth, file.name);

                // create the spritesheet object
                const sprite: any = {};
                sprite.meta = {
                    app: 'lss json-generator',
                    image: file.name,
                    format: 'RGBA8888',
                    size: {
                        w: img.width,
                        h: img.height
                    }
                };

                // populate the spritesheet object with frames
                sprite.frames = {};
                for (let i = 0; i <= img.height / tileHeight - 1; i++) {

                    for (let j = 0; j <= img.width / tileWidth - 1; j++) {

                        const frameNum = Math.floor(i * img.width / tileWidth) + j;     // count frames from left to right like reading a book
                        const n = frameNum + '.png';
                        sprite.frames[n] = {
                            frame: {
                                x: (j * tileWidth),
                                y: (i * tileHeight),
                                w: tileWidth,
                                h: tileHeight
                            },
                            rotated: false,
                            trimmed: false,
                            spriteSourceSize: { x: 0, y: 0 , w: tileWidth, h: tileHeight },
                            sourceSize: { w: tileWidth, h: tileHeight }
                        };
                        console.log('added sprite ', n);
                    }
                }

                // create JSON file from spritesheet object
                const log = JSON.stringify(sprite, null, 2);
                const name = file.name.split('.');
                saveAs(new Blob([log], { type: 'text' }), name[0] + '.json');
                console.log('saved');
            };
        }
    }
}
