export module F {

    // ABOUT THIS CLASS
    // contains useful math functions, etc

    // RETURN A RANDOM INT FROM A RANGE OR FROM 0-MAX
    export function ranInt(min: number, max?: number): number {
        if (max == null) { max = min; min = 0; }                      // allow for just 1 argument and use range 0-number
        return Math.floor((Math.random() * (max - min + 1) + min));
    }

    // RETURN A RANDOM BOOL
    export function ranBool(): Boolean {
        return Math.random() > .5 ? true : false;
    }

    // CONTROL & RETURN OBJECTS X AND Y BASED ON A BOUNDING RECTANGLE
    export function boundary(o: any, r: PIXI.Rectangle, bounce?: Boolean): any {
        if (o.x < r.left) o.x = r.left;
        if (o.x > r.right) o.x = r.right;
        if (o.y < r.top) o.y = r.top;
        if (o.y > r.bottom) o.y = r.bottom;

        if (bounce) {
            if (o.x === r.left || o.x === r.right) o.v.x *= -1;
            if (o.y === r.top || o.y === r.bottom) o.v.y *= -1;
        }

        if (o.x === r.left || o.x === r.right || o.y === r.top || o.y === r.bottom) return true;
        else return false;
    }

    // RETURN CENTER OF ANY OBJECT WITH RECTANGLE-LIKE VARIABLES
    export function getCenter(o: any) {
        return new PIXI.Point(o.x + o.width / 2, o.y + o.height / 2);
    }

    export function keyboard(keyCode: number) {
      const key = {
          code: keyCode,
          isDown: false,
          isUp: true,
          press: undefined,
          release: undefined,

          downHandler: event => {
              if (event.keyCode === key.code) {
                  if (key.isUp && key.press) key.press();
                  key.isDown = true;
                  key.isUp = false;
              }
              event.preventDefault();
          },

          upHandler: event => {
              if (event.keyCode === key.code) {
                  if (key.isDown && key.release) key.release();
                  key.isDown = false;
                  key.isUp = true;
              }
              event.preventDefault();
          }
      };

      window.addEventListener('keydown', key.downHandler.bind(key), false);
      window.addEventListener('keyup', key.upHandler.bind(key), false);
      return key;
  }


    export function randomPastelRgb() {

        const h = 360 * Math.random(),
        s = 100,
        l = 60 + 40 * Math.random();

        return this.hslToRgb(h, s, l);

    }

    export function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          // tslint:disable-next-line:no-shadowed-variable
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }
        const toHex = x => {
          const hex = Math.round(x * 255).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        console.log('rgb', r, g, b);
        return [r, g, b];
      }
}