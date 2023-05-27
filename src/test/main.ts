/*

// we now have a quad p0 p2 p6 p8
// then ad
const t = 0.5; // goes 0 to 1
const u = 0.5; // goes 0 to 1 

const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
const z = (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z;
o h
*/
import * as dat from "dat.gui"
// inspired originally by Tim Holman
// Bezier curve simulator
// https://codepen.io/tholman/pen/kKKVxB?editors=0010

interface Point {
  x: number;
  y: number;
  z: number;
  name?: string;
}

class BezierTriangle {
  private context: CanvasRenderingContext2D;
  canvasWidth = 1;
  canvasHeight = 1;
  selected: any;
  points: Point[] = [];
  projectionMatrix: number[][] = [];
  camZ = 100;

  constructor(readonly canvas: HTMLCanvasElement, points: Point[]) {
    this.points = points;
    let gui = new dat.GUI();
    for (let i = 0; i <= 7; i++) {
      let f = gui.addFolder("p" + i);
      f.add(points[i], "x", -200, 200);
      f.add(points[i], "y", -200, 200);
      f.add(points[i], "z", -200, 200);
    }
    gui.add(this, "camZ", 1, 150);
    this.selected = null;

    this.context = canvas.getContext("2d")!;
    // Set canvas to full screen.
    this.resize();
    document.body.onresize = () => this.resize();

    const img = document.getElementById("mona")!;
    img.style.display = "none";

    var imgCanvas = document.createElement("canvas");

    // Set the canvas dimensions to match the image
    imgCanvas.width = 256;
    imgCanvas.height = 256;
    // var imgCtx = canvas.getContext("2d");
    // imgCtx.drawImage(img, 0, 0);
    // this.imageData = imgCtx.getImageData(0, 0, 256, 256);
    // Get the pixel data array
  }

  getPixel(_x: any, _y: any) {
    // var data = imageData.data;

    // // Calculate the index of the pixel in the data array
    // var index = (y * imageData.width + x) * 4;

    // // Read the RGB values of the pixel
    // var red = data[index];
    // var green = data[index + 1];
    // var blue = data[index + 2];
    // var alpha = data[index + 3];
  }

  resize() {
    this.canvasWidth = this.canvas.width = window.innerWidth;
    this.canvasHeight = this.canvas.height = window.innerHeight;
    console.log({
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight
    });
  }

  project(pt: Point): Point | null {
    let dist = pt.z + this.camZ;
    if (dist < 0) return null;
    let zoom = 150 / dist;
    let canvasX = (this.canvasWidth - 245) / 2 + pt.x * zoom;
    let canvasY = this.canvasHeight / 2 + pt.y * zoom;
    return { x: canvasX, y: canvasY, z: 0, name: pt.name };
  }

  // Render the key points of the curve
  renderPoints() {
    for (let i = 0; i < this.points.length; i++) {
      let pt = this.project(this.points[i]);
      if (pt) {
        this.drawPoint(pt, 2);
        this.drawPoint(pt, 8);
        if (pt.name) {
          this.context.fillText(pt.name, pt.x + 15, pt.y);
        }
      }
    }
  }

  drawPoint(point: { x: number; y: number }, size: number) {
    this.context.fillStyle = "rgba(0, 0, 0, 1)";
    this.context.lineWidth = 3;
    this.context.beginPath();
    this.context.arc(point.x, point.y, size, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.stroke();
  }

  draw() {
    this.canvas.width = this.canvas.width;
    const fov = 60; // Field of View in degrees
    const aspectRatio = this.canvasWidth / this.canvasHeight;
    const near = 0.1;
    const far = 100;

    // Calculate the projection matrix
    const tanFOV = Math.tan((fov * Math.PI) / 180 / 2);
    this.projectionMatrix = [
      [1 / (aspectRatio * tanFOV), 0, 0, 0],
      [0, 1 / tanFOV, 0, 0],
      [0, 0, -(far + near) / (far - near), -1],
      [0, 0, (-2 * far * near) / (far - near), 0]
    ];

    this.renderPoints();
    let p = this.points;
    // this.drawArc(p[0], p[1], p[2]);
    // this.drawArc(p[6], p[7], p[8]);
    // this.drawArc(p[0], p[3], p[6]);
    // this.drawArc(p[2], p[5], p[8]);

    this.drawQuadraticBezierCurve(p);

    // let width = this.imageData.width;
    // for (let y = 0; y < 256; y++) {
    //   var index = y * width;
    //   for (let x = 0; x < 256; x++) {
    //     let r = this.imageData[index];
    //     let g = this.imageData[index + 1];
    //     let b = this.imageData[index + 2];
    //     index += 4;
    //   }
    // }
  }




  drawQuadraticBezierCurve(p: Point[]) {
    let p0: Point = p[0];
    let p1: Point = p[1];
    let p2: Point = p[2];
    let p3: Point = p[3];
    let p4: Point = p[4];
    let p5: Point = p[5];
    let p6: Point = p[6];
    let p7: Point = p[7];
    let p8: Point = p[8];
    this.context.beginPath();
    this.context.moveTo(p0.x, p0.y);
    let v = 0;
    this.context.lineWidth = 1.5;
    while (v <= 1) {
      let v2 = v * v;
      let _v = 1 - v;
      let _v2 = _v * _v;
      console.log({ u2: v2, _u2: _v2 })
      let u = 0;
      let first = true;
      while (u <= 1) {
        //let u2 = u * u;
        let _u = 1 - u;
        //let _u2 = _u * _u;
        let x, y, z;
        /*
        if (v < 0.25) {
          x = (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x;
          y = (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y;
          z = (1 - u) * (1 - u) * p0.z + 2 * (1 - u) * u * p1.z + u * u * p2.z;

        } else if (v < 0.75) {

        } else {
          x = (1 - u) * (1 - u) * p6.x + 2 * (1 - u) * u * p7.x + u * u * p8.x;
          y = (1 - u) * (1 - u) * p6.y + 2 * (1 - u) * u * p7.y + u * u * p8.y;
          z = (1 - u) * (1 - u) * p6.z + 2 * (1 - u) * u * p7.z + u * u * p8.z;
        }
        */
        let xh = (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x;
        let yh = (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y;
        let zh = (1 - u) * (1 - u) * p0.z + 2 * (1 - u) * u * p1.z + u * u * p2.z;

        let xm = (1 - u) * (1 - u) * p3.x + 2 * (1 - u) * u * p4.x + u * u * p5.x;
        let ym = (1 - u) * (1 - u) * p3.y + 2 * (1 - u) * u * p4.y + u * u * p5.y;
        let zm = (1 - u) * (1 - u) * p3.z + 2 * (1 - u) * u * p4.z + u * u * p5.z;

        let xl = (1 - u) * (1 - u) * p6.x + 2 * (1 - u) * u * p7.x + u * u * p8.x;
        let yl = (1 - u) * (1 - u) * p6.y + 2 * (1 - u) * u * p7.y + u * u * p8.y;
        let zl = (1 - u) * (1 - u) * p6.z + 2 * (1 - u) * u * p7.z + u * u * p8.z;

        x = (1 - v) * (1 - v) * xh + 2 * (1 - v) * v * xm + v * v * xl;
        y = (1 - v) * (1 - v) * yh + 2 * (1 - v) * v * ym + v * v * yl;
        z = (1 - v) * (1 - v) * zh + 2 * (1 - v) * v * zm + v * v * zl;

      
        let pt = this.project({ x, y, z });
        if (pt) {
          if (first) {
            first = false;
            this.context.moveTo(pt.x, pt.y);
          } else {
            this.context.lineTo(pt.x, pt.y);
          }
        }
        u += 0.01;
      }
      v += 0.01;
    }

    this.context.stroke();
    this.context.closePath();
  }
}

async function setup(canvas: HTMLCanvasElement) {
  setTimeout(function () {
    const bezierQuad = new BezierTriangle(canvas, [
      { x: -100, y: -100, z: 0, name: "0" },
      { x: -50, y: -150, z: 0, name: "1" },
      { x: 100, y: -100, z: 0, name: "2" },

      { x: -50, y: 0, z: 0, name: "3" },
      { x: 50, y: 50, z: 0, name: "4" },
      { x: 150, y: 0, z: 0, name: "5" },

      { x: -100, y: 100, z: 0, name: "6" },
      { x: 50, y: 125, z: 0, name: "7" },
      { x: 100, y: 100, z: 0, name: "8" }
    ]);
    // bezierQuad.draw();
    setInterval(() => bezierQuad.draw(), 250);
  });
}

export function setupWebGpu(c: HTMLCanvasElement, output: HTMLDivElement) {
  debugger;
  output.innerHTML = '<img stype="display:none;" id = "mona" src = "data:image/png;base64, /9j/4AAQSkZJRgABAQAAAQABAAD/4QsyRXhpZgAASUkqAAgAAAAKAAsAAgAKAAAAhgAAAAABCQABAAAAAAEAAAEBCQABAAAAAAEAABIBCQABAAAAAQAAABoBCQABAAAASAAAABsBCQABAAAASAAAACgBCQABAAAAAgAAADIBAgAUAAAAkAAAABMCCQABAAAAAQAAAGmHBAABAAAApAAAAPIAAABQaXggMi44LjkAMjAyMzowNToyNiAxODo0NDo1NgAGAACQBwAEAAAAMDIyMQGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgCQABAAAAAQAAAAKgCQABAAAAAAEAAAOgCQABAAAAAAEAAAAAAAAGAAMBAwABAAAABgAAABoBCQABAAAASAAAABsBCQABAAAASAAAACgBCQABAAAAAgAAAAECBAABAAAAQAEAAAICBAABAAAA6gkAAAAAAAD/2P/gABBKRklGAAEBAAABAAEAAP/bAEMADQkKCwoIDQsKCw4ODQ8TIBUTEhITJxweFyAuKTEwLiktLDM6Sj4zNkY3LC1AV0FGTE5SU1IyPlphWlBgSlFST//bAEMBDg4OExETJhUVJk81LTVPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT//AABEIAIAAgAMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAIFBgEHAP/EAC8QAAEEAQQBAwIGAgMBAAAAAAEAAgMRBAUSITFBEyJRBmEUFSMycYFSkTNCsWL/xAAZAQACAwEAAAAAAAAAAAAAAAADBAABAgX/xAAiEQACAgICAgMBAQAAAAAAAAAAAQIRAxIEISIxEzJBUWH/2gAMAwEAAhEDEQA/ABiM3wF10bqqk0GbRzyuUCOVx7GqEnxkdG0MMPSeMbfHagY6/kqbF0LNjIUyyhyOUUMHFogj3WSpsVQoIb5AUmwurymNgbyTSgcvHY6jPGP7ClslAfT2mqKkBZ5TAlhl5Y9rv4KjsBKmzJQMRg3woGEDtOAACghPAtRMugAZ8Bc9PtHHXAXwaCDXall0DZCKJK5sAKPXttcczi1GzNDfpnZZUSw8cJotNmh2o7CTyhWbAhgA5CgWhxpNObQoIYZ7v5UsugAhF8dJHVdRZgM2NAdKemq0y5Y8THdLIRTRaz2m6U/Wcl2XkbiHngXQARIUltP0SrdIqZJ8rL9STJlcQBYaDQCrJPUaf3L01n0/ith2CNtEKl1T6cgaxxawAjqii4+ZC6o28drpmMjyZI3XZH3aaVtg69JA9rZyZIvnyFXZmGYCR3ST6NJ1xjkQBtx6Z6TjyMyImyRODmuFghcewg2VlfpjU3Y2UMWV36Uhpv8A8lbR0YI55XOyY3jlRpOxVrLtT9L22iiLmx0p7KHKxfRYvs46XzhwmHAmqHCC5vdhZtkotG7S2x1SjsY4EtN8qidqbv2Oca+yjBqzmO9p3XxRV/HJk2SLuvfRXGgmW64UMLMZkg+2nt7R55Ww47nkc0Vhpp0X0zJ/V2a2UDFjJ/cOvKvvp5vo4TBVe3pYbVJTJmCS7G4FafG12CLHbsAdXBJICZz45fHFI3iq2asSHyEhqL3FtAdoT9WiZp34oAltcD7/AAqX8/kkjMsjGtYTxbgL/wBpGOKUu0gySiV2p4L3lzgFmciMxvLSOR5Wnn1lk7jGxhDj4WbztxndYK63G3XUhfNq+0Lte5jw5pog2CvQ8LU25GLC4miWAkn5XnXYV7p2QW40TR02wUTkQ2SF06NpHkh79rUX1Q/j5JpZ7HyQ1txk2eOU1FmD8Q0BwO0chISxM3v2XbTx8hckAJX0bt8YI6ItSc1oi3bhfhLthDHmdrWk98VaEycxFrnWTaCyRoZscP7UZW3VH+F1FFC1stsLWBjeqK9ziTu/8C+/OJLdHK7eC2xfgqjPA4JS8srw/g2p8EWy1JkpiHZjGu6Mgv8A2tt+SY0+PtY2OnEONs8rAvk4B8g2vRNJzhPhRgcv28BB5m0VFobwU7RDUMRrNKbjtFN38KbdIjysGOJ/pFo55b5Sms6vBBHHBJvEv/ZtdJ/BygdPjl3Vub0e0k1OMEw6puhKbT8XToXU1heR2G0sPqcl5Ti3q1qNZzS8nlZDINyEnyuhw4S+0hfkNVSAjvlWOA4mItA6Pyq7zwmsTIdCfbXKckrQoXMR2x/updZMBKXE+75QYtRO0B8bD96Rm57N3ugjKXcX/CjWYGSyTEbVccdqUsm72hZ+HUYWNsMAvwFGbU3EO2cV90k8DvoKpoqLG3l3Ki6W67oKDxzd/wBKLSfAXSoCTLiRQCC6NxBJTTdxNU0c+QiuhcIi4htVfCq6LXZUvaGso8m1pPp3KZLA2IS+nK3gFZ6TaTuPn4QWzux5xJC4tIUyY/kjQaE9HZt9XjMj2l72vkb070ihYpc1pM0pJrgAUAo4v1XBJgCOZgEgFHhVWVqgeT6dBpSMcWT6tDbyR9phdSmaS7as9Ly8pqScv4Fk/KVcDfKfxQ0VCmSWzBdJnG5dQS5FI2M/Y8fdFfoCOt4XPPHCmx0e7kXa+eWucBwAhWVRKNrSfceER8sYFMFkINs2/PC417OaAtZogeNhcCbACM2Ngq3Ls0jWxe4An4StAttx4IJH2U2s1qWUe1riP/VHIe3YefCpW50rW0XWOgfhRly5i1pLiWkUfurcHZVkZgBKe6tLvFnhdsvJJJslFxsSbKk2RNLj8/CJaS7Ne/QTSYmS57YpBw8EKyy9H9N1sHCs9H+nfTqV5/U8K6kwiQBVpDLykp+LGseHxqRj4dPN0WoOfimJvAoLaDTtrbqlVa1iD8O4ghVDlbTRt4lRjHCnIgDQ9to/o3uNdBAyB+pwugnfQnKND8EYkIotb/JRnY5cOC3jqvKqoQ4njn7WrDGgzKJiaRfk+EOar9MIm7CkNNuieaUxpz2tsva3+6TemY2ZFITkC2ny5fZUjTI5oAIHkdH7IDyPakEUVVsiMdxI3NBv5QMv/j2MaAC1M4mpB1R5EfXG9TyIhIKYASORSq3GXkaqyidCfw7gPntCkbtiaHEWAns2T0GbHD3lVhtx3ONlNwbfYJqgsETpSNoNXyt39MaW2PF3uaC4m1UfTumerjhxHJW5wcZuPA1jR+0UubzORfghzFBRjb9hWQNa0eKUXRgu4FJkc/ZRMdOBXNsIpCkzKbSzWvtb6Dg40tTkMtpPSy2u0SBV8o2D7o2u0Zd5DWSBvVKtsvkPklW5x3yuc00wHhNQ6SyFgeTX3dQXYWWMPYpOLk+iiMT4ze08Kz0rNdDJZdbfgruY2Btj1Gk+acSqf1PTeTGfK31ljTBNas15mbPRO8H+EtJEx5c1r3cHmxVKnxtUmaQBX9gKwZrTeP02kk8ghKvDOPo1aZ2PGjdISZAAOjSnLLi4dSmRz3j4FKbY4wwNdJVdWqXU6blbWvDmtHFLcFvKmwmRaKxfLndlZDpXdu6HwuMj3PA+EPynMQhrC80eU2/FdCy7ZpdA1L8vNSDcwi68hamLWcOaIFkoDv8AE8FecmY+rV1XJKYhlMg3Hrxa5+biqb2Go5V6Z6hjODmbrBRi5pC81hzpoR7JZGgfDkwzX8xvH4h1fflKviS/DTcX3ZtszIhihc6QgALGarqMLyS3r5SGoatPMCZJC4/HgKkycovpos15PX+kxx+G07kZlmSVIffqpjBGOwNP+R7SE2dLKbfI9xQGBz3e7pHkjYymgc9ldBQjH8F3OTFXyOJ5JULtTc1ziS1p/wBKJaWjkdogNnzSQbCZEZe0Ec2lUxjyPaKaOByql/gTG1dM/9n/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAEAAQADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAgMBBAUGAAf/xAA3EAABBAEDAwMDAwMDAgcAAAABAAIDESEEEjEFQVETImEycZEGgaEUI0IVscFS8DNDU3LR4fH/xAAZAQACAwEAAAAAAAAAAAAAAAABAgADBAX/xAAkEQACAgICAgIDAQEAAAAAAAAAAQIRAyESMQRBE1EiMmEUcf/aAAwDAQACEQMRAD8AQ5mPJrlSDRIHngJu1wJKlsQqvC5NmkW0ivGSShfg0BXmk4wl37dqUenk2CULDRX9xGTYJwEJd88drpWjt4pI2WT58opkoSAfccjOVNfIvujc0gnvZpHso3VouRKEUfCY2uSMhExpzhEBmhzSFgBDSR4C8Wdkwx7aPPlQ+zRUslCHMt32XttZqk8N7YU+nbckg/ZBSI0Vxg4COnEdqKcIrNIvTdwAjyBRWDSayi257ppjIGaCBrXlx4Q5BogGuyloDqsUp47IhdeELDQBjzyaXhEDkWmc0GhEWmqHdGyFTZ7iMqTH7SaVmsc90JB2cI2GhIYAKAUgAcBFVo9o72hZBGzPP8rxbY9pspzmtGFBbQ4pSyUJ9MkXZv4TRHTaspjY674pMIAGew5RbFoq7DaLZR/dG4ZxgBDwfKASw2yM/wCyZtqsk57o9ot3nKg+cpSAA+QVD4w43z9lI7EnCLAzd1woEQY/OPm0OwNwSD91YD6OR+6E27PAUIILb4HflQQaoH+E8sG27whI3fcKWShTW/PdSI6PhG0ZyfspBJ4yhYaBfR4OF4s48I9gLcJhYKUsAgR3xwpAJKZto0Aoc9rD7qACK2SjxLQAAiaeMKpN1HSxup0zAf8A3JY6vo//AFm/lHi36DRoOaHIHRgDCRF1DSyYZM11cZTmyNdkOCVpolAFvkFQGHNHlMNWMqWmsEcqWAhrCSExwFUou+MBeuxxx5RsgtwG0lARznHZMf8ATgCkB4A5RsNHmgKTzXYKASpcCDxzSiZKB25zwvFtV2vlSD8Vff4Rlu4B1EmwoRgjIIpefbc9lLQDd3wvPFHOFAAnnF0hcMEeOcJ4b5+Ut4GcfKDYCw3cW+OylzQW/hNYzGQvPbQu8JLHoTWEIFZP8Juw4sc5Xgwbr7I2QWGkuAocI9l7jhG1pH7KDdmuyDILIwcV2S3RkEeDlMcTZBRNANWcKWShHpVz2XmNJHGE+t2fCJoAArKCYWhbGjbnlKmnZCCZHAAfKnWzs00Ze40B5XIdQ1smvkw4iPwO6uxY3MVl3qP6jcXFmkA8bis+R+o1DXSzSuqvKUyDbQDbtW9QzZpGsBBNWVqqMKUUPGPtmSZHNyo/qDdkJz4xX1fskOaA40r1TKnaGCZhNnBVqHUzRtuOV1/dZ5bhC1z2H2OIUcUyKVdnR6Xrro6GpbbeNwwQt3S6qLUMDonBwPcLhRP6gDZOeyPSa2bRS74XYHIPBVE/HUutMbkj6FwAFJoAKl0zqEev04eyg4fU2+FoDPbtlYXadMIhxFeT8JYs/HwrLo/P7JbgMAchSyIVVHCMtca/lTWc/wD4mACgcZRRGK2kk4zwF5w9tJ7G8/7qXAE0FGwCQAaIyvPaL8hM27RShwo0l5Bo8AOP4SzwcJlm0LsZPKFgouPb7vF8qCcXaYRubbhzwFBjHHIUug0KJ3AZqv5UAJhjOBQ+6kABwFWhYQQzPZC6rOU44PhLcCcAWpZBD2iifPhG3hFswbUsAu6wo2GiGsLr9qJwDQe2E0gBpWN1vXjTad4DvccAlNCPJ0BmF+oNa7Van0IidjTWO5S9D0TUzbSW7QUzomlOonM1c8OK7XQ9Pa1u57nEVdXQV+XP8S4RHhBVyZhaX9PBoBeSSE7UdEikYNwyOaXTtgYG4aApdC0tyBf2WJ553dlilHo4PUdBYBQe4FZOs6PJCS5jrA8r6NqNKx120LF1+jZR2hXYvKle2F44yRwTo5G4c1Jc0g5XQavThpKx546eV1MeRSMk4UVaRA4p35UOwV5uVaVlnpuuk0GqbKw23hw8hfQtHqGajSsljO4O4XzSu3ZdF+lde6Kc6R7iWuy37rL5OLkuSHi/R1+SQL7pboTuyf8AhWGt9mOeVBzRxSwjFcsrH4UtaRRFhPoP7YXtu2hRIQuhhVYyi224cpgbRUHjCDZKPEANJpLFFxtMouPGOFBbknhKQS76soXA7cUnFhs4v7/7pRB2kDlEBqtYAwCr+6naduf2QMcXgVVhMO1rPcaQegiTGfvfleMZaRaNs8b5AB/KN4t1dkoUVz9XZQ0e7nA8L0jaN0AijotvxyiiC5C2ndgEUI3CkLwSXBoxabFHtJ7fdFOgNA6lzIo3OdQAFlfPP1HPJNrG77Df8Wrquua3aXMDvZH28lcZqXu1OtYXn3EgLb4y3yFcaR1P6fjDIWbeF18BHpgjiqXM9Gj2RgHil0LXDY0A0R/K5+d3Ns1V+NFneBkYwiu82kbbJK8LqjeFQLxRMpFElZOsezbVLRlB24WXPGSSO6MVsuj0c/rmFxNLE1MdFdXPpy6yQsvU6PJJC6ODKloryQs5ki3Z47pThRwVe10QY7HCpFpGV0ou1ZikqdA3mimaed0M7JIzTmkFKIXhyn7E6PqOh1LdRpI5LG1zL/hFvBADchcx0HWvd04RWfYS3HK14NSBF7nEm6/dcqeNxky1OzUtoonFqRI0n6vss1+o3AAnjgd1agduHagqnFjWWyWg0e4wluycJTJA+d57NFKYpN4xQo0EtUROxzXVyaxwmEbuEptk8dkRBBQsLPPbRrhKLcEhOJsYKWTgj5StgQoa2s4ojyol1LnjcCPaaryFjyzbLAqu5Qs1DgLqwtHx+ycjU/q9h+QOyvR66IRNc8jeTW1cy3V08+0ntlFFM58oJGSTX4R+L7F5P0dawslANgowwNsc96XNRaqTTv3A4b2K6Jri73NGSLVUotDKSYYGXUO6mcBjC7m1DPaXXQIKz+o6gt08gaexSKDbDyRyvWpy4FwOHPsrCjcf9RiJPcLS1T/U9t85WVtEeoZRv3Lq4o1GhZM+hdPDfTbv8eFpNliaQ0HP3XF6frEh/stLW0MucaARSa9u+v8AUI9/gAgflc+XjybNanFo7prhwO6mR4YwlxAFfhYfRte/URGKQ+9tV8hV+v698TPTByeyzLFJz4hpLZpzdSgD9rTuP3Sv6uN9Gh+VyOjM2ocXOkEbP+ops+r0sftb1B3qDsYzS0/5qdInNVZ0M8rAcEG/lZurmaQchYcvUZ2GtzXt7OC9DqJdTdNJpWx8Zx2yv5U9Ira99vKzXE/stHXRu8LPLTS6GP8AUyZOwQckLxwVANOUqwQ2ehS7YZhdUQVpwTiywOwFhdNeQ+VjcbmrQidsbeQbySs2SO2GzUYH3uBJV4ar027QFkwalxfTj7DjHZWN7i4XkXhZ3H7I5GkJ9sZPcNLimaCUOvcaF8rLk1TGRva69zsAfCbpZLhb2tJKGiRezoGEAADheeb4SNK4Ohb/AMKy4AAkHKyNl5AbbjXfwhePTjJ/yKdE4AbhW7ul6h8bsVZCXsi0clRLTZH7o3DbCdx9rfCq+q27At3YdkEksjQYi7D6XT4tlFkxyerQDaAPZWtM+pWuPAtU24FA44wl+q8PoH2p3G9CqVGtG5s/UPRlO1hFuI8ALof66OOIODvaG0FxL53Nm3A5c2iU9uud6IiJJ2igqZ4W6HjJLs229bkZOdwtjyQK7Jk+oZLpvUc8U67XOzShumbzfKiHUuOmZGeASVPh1aDy3RUnJdqT/iPCp6cet1CGMZt4VnWE+q0gfdVtA7b1WFxx71rX6t/wb2kdYzpEA1DZnwHbgkfP2VfqPTdDPrPUa2UvP+IGAuo0socwU3thWTGxx3FovzS5CzzTs2OMemjL6LpG6aRh2loDSBu5Wb+oYy/X4JwukY3e8kWsfqLQ/VEnJtDHJ8+TC1ehXS4oIow58AcaqyOFT6l03QanVO1BLg88j5XR9NbH6VOAoK42OHbZjbj4S/NKM20SVVTRxWm6Pp5HioHFnz3WnLooNNBUcbW2tyctZGSAFg6/UCjlOss8jCopKzmuqbQSsbdVhaPU5Nzz5WWbtdjEqiYMr2eOSVPKGipaVaVFrQOrUCzXtPK0BZBBcsqHGoYtSOIXuPKqmt2Rjotza2EH7qw572uB7pERaCM/smySRk1sNjuqXsDPTPMtXjthNgcYdufbeVUfIBRdZFomzEdiQT3QcdATOv6c4bNp7K67AOefCwOl6kbrLnC/K1nSAnduBH3XPnCpGhStDTYFA1SqzEG8EhE82TRr90De4KWgo5LSj3NNhMlj3A2Td3arcEjuibOQQHmwDS6te0ZwnBzYqZi+6rvsO4uyrYp4sDlIFe4k5BRTILbuLgcrwe5gI/xvKIOtu0DANoDdmx+ExAZZyWBrjwlCfJF4A4XpzmuaSC0l3wfhMkiJ7Hby54Lu/dJsDUsc0kbXDK8x+xws7hwlPJ3WObtFItb0fTOkTNk0ouiaWi51MJJr4tcj0PWERMN/4hdHBJ/Uir+64mbG4SZ0ItSVlrTPLmFw4WJr3XOaFn4R63W6jpMDmTM3NP0SAf7rlZes6mSckZsq3DhlLaElJR7O06dI52nsDvSverTCT38LD/TcznaR5nxbroq/qNS0CmnCoyQqbRYtqxet1IDOVzmsmuzau6uYkUsXVPJu+FqwY6K8kjL1breqtX+ysTd1XJpdWPRgl2RkKAcr14XgERRsRAe13NG1rw6qNvLG2FjNsYpOY6yNyScbJdHQQarSOb72tDvsnb9K4imsF/dYDDwQTx5TWy5BcOFS8X0DkbQ/ojdlv2CYyDSvFtdeOA5YZkAyDj7qWSYtpPCDxv7BZ0TIYA6w52PlW27QPq/lc9DqnNYXPPJoIzqyctcbVMsTYylRuSTBuXS191Wk1ob7g8kWsqWYuABNkmrQTyexrGux3QWFB5srtJe//krzgTxn9lDXNo0SAvOltmLHyVq2KMa97YxVfhLsA15zlLLi4/UfwoLngjHdGiDQ4WLOSfKB59xI4/CE+7lpyV4NJbVo0SxT3A8DKCQWARd1lP8ATAyT+F57AHc4olFMi7KjRb2hRJHtyCDacNrZMpLjbnEnKZdlmqNvoEgfEYzy0roGah+jG9rXOHxm1xXTtUdLqQ4/SeV2vTddHLtdgrB5UGndaNWCdxofquo6bWaZ0MrZGX/1tpc64aKCUlgwD4XVazUShhdFEHjxSw55JZTTtGxn2Cz4XXXX/S6SVCI+pFxEWna8k4wFpRtk2e8klVID6Q+mirB1H9s9gmnvpAX9K+qHJ8LJ1JFFXNVqAbysvUPtaMMGVZJIozGyaSPJTZMFLW5GRgd8qQawvGuSUPdEUa2rtWY622Gqq08K5A07a85Ql0AY1oqyG5RDHYKOCBz+ynyRykQKBc2uG8qNxugprvnK8K7ValgJG+rs0msiLjzlA13khPZKAKvjwkdkGNhoDccDjKB9bgOwFWUt+pHbJ+6W95kb7qH2SqL9hPSBoaaCWDYtw4TnEW7dxwEs0AaCsRCARnyia4d+LSgTuJo5RgEHIKJBwdGC3FecogYiTd4QPYQ8B3PN0jaIy6iw2lIe/sjBc5RK1pDSRYzStRQRPbltfsg1cQbCdo+nIwlvYyM2aiaAyEn0iBdpoLS/3f5JJcQSOaPCtQ7oGRhaLVnpvUJNJK2zbFVlcXcpNpnFSVMCk4u0fU+ja6DUaYOBFlP18kHpGgL7YXzTp/U5tGaa72rTf1ySRv1LmT8KSla6Nkc8WtmvqJGMOTSzp9YCC0FZ8utdL9TlXMzRyVfDBXYssv0WHzF5SJX1jlKdOXCmYQAF31ErTGNFEpWATZQo3No4UVSsK2hRC8QjwgPKgAmchXtM4baJpUWmk+F3vOaxSElaIXHM92Di+6ayElt2KKR6u1tgWflEyVwHI+yqaYNDnBjc/wCLf5KrhtgEI3SU2nUoZIAP2QSaIS0AjnhEYrH1C/ygEgDSSDhec8Fg3CrGKR2Cj3pDguBJRlrQ2ySq+8B3J+EzcHt7kqEGjDaLTzzaklu36PyoY0OdkuKt+xoAAqxiyjdEEMaD/wCWb+yY1jyRUffuE0EeD+eF4SNd9Dv5QsNBBkm4FwYAOMqw0D6Rtz3ykPPs4+bARh7b4IFINEQbyGsNEE2q+o+kjtXhNe8AEVSr6mUDvyaCWgmRMKeAeySAeawrOpO6SNtZopALq2gijZ/CuXQyFuBokpVZ+E1ziWgHhBXak4rAIWr07RjU6UmsgrLINrf/AEy8F0sbuDRVWZuMLQ+JJyplOTp5YTR4VUwEGiF2Go0rXg0AsybRBp4Coh5F9l8sX0YzIcp7dOXfZXhpfhWItOQ3g0mlmAsZlugDRxmlSlabXQz6f4ysbVRU6u5JTYsnIE4Uig7CishMe3sQl1a0FDQe0bQihZb+aUkENFoYn7H32U9AZcDBR3H/AO0bA26AtBHsLAHv+wV6AaatziCAOFTKVASEgMoktBP3SXNOSCK+CrpjgkdTGgWPKl0MZpjG/hJyDRQAfVhtjuB3SnlxNkVa1f6XZGXFzWhvZQzTNlaTV/KPyLsnFmY1oJBIIRjcywGk/K126Jg5DWgd7UyRaZjTU3u44sJfmTdDfGwQ9uAIxucgmjZub5HKlrmss0b+VUnks89+SorbIlQIcRJJ6TdzaGSe6gxO/p/VsgkVj+EyMB0Tu4Au/wCVHqVCGPwKTW/RKEx9Qc1novH043fCe7WtawOEhFYAFZWWHf3n0L3YQB5jxQ+QQrXBMSzVGvc+BxoBw5PnyqztY7UNG6g9uQkw+9slYFWkG2vsHhRRRLDllfJOC45ApBZ5UAkygnuUQFkiuM2m6CgbypzakN3Opv7LY0HRpJQJJhTf+nylnkjBWxowcujM0+lkndTGmvK6LpvTn6ba+qPcrT0HTdtewNaOKHC2ItPG9hZt470ufm8rlpdGqGJR2Z7Y3bfdz8pL4N3ZbBg9tG0gaY/HzhY1kNFGUNLzhM9EAUMrVbpe5C8+EbDQ/hT5AUY+ohIAI7rA6pEQ4mqIXXysb6eTfbjC5/q0bNxsj5C0ePk/IWcbRzjml5ocqHR01PLf7hAJAAsYRPZWlaTySunyMjiI1AAjaR4yquVa1AAG3FhVtuU8eiufZ7ccG06LcSPcktA3Z4VhkIfWx4u+5pRiUE1z2SNDXY8q7/WiFpjaPfzvBSodA8uonnwrkfRwMuDnZ8qicoewpMoM18r5qkALSeF0OidHMwgR/TV4VFnQ/duqvgrS02kZp2lpc1tDOcrNnyQaqJbjTT2KnawyHAA+eypSgSPLaaI2/wCQHKZrpRINmnYQ68klVnE0xh78o41qySkF9ZPYWobBG8m3Yb/KsjTt2U4e4nI8KYdOz3gE15Tc6JQsQsjgsCm+PKo654MQI7Vdd1dcHejs3Eji1QcwFgDzm6pPDu2BopQt/vXV1lRrWlsnHGOFZawOkFAtA7henj3NAPJV/LZXRWgNQvHkhA9tfZWWsayMjNc5VaV7S/2mwEydsDWiGi3BS0Eu2jJKiOy4Ur2n07mkVlzlJSoeEWyx0bRiXVgPaSBzhdvpNE1jb+Fk9C0gBDruzn5XVRxN2kYC4/lZXKVG6MVFAxQhoArCa2KnV2PZNY0D6jfhE40Pb+VjbJdld0NE0EsMAPk+FYIJBvuhY0EcZ7pbGT0La05sUkyiwcfwrhbjKrPFk2fymCmZuqsigMrmussIl2clzvHK6jVjJII4XM9VlHuDhnstfjXyJLoyCxrHAvBKLUOHpMx4UzyFzW8bq7JepIETc3VLpLdGeWijqHW/nuh7X4CFx9yZG1zztHlaOkZbtgBpLbTI37SOx8qw7TPDBQ/lIfC9ovagmmRxaLUOpfG8EOPxldF03VNfA4yUXlxI70uTjftcMY8LUg1HoNw1wDgs+fHyQYujoXufIwhg/elTIka87uQMJLJpWlrQxoJ7GzhWBJMXbA1gPkjBWPjxLbsqubI1x3MP4SJWuP8AkLJGaVyfWTMn9Go3Adw3C8aAL5jQbmmiiSnUmtsVpE6DVM1BkEobubx5IKsmEVbKA72uWc15ksLR0eslhc1r3lzHGqOaVs8Nbiwpl8xNGHOACzp4/Tfv+oDAWhI6PLXlu4/KW6B72Hb4/hJGVdhaM+MtcbN5/hK1b2trgAK1qWeiwkihWFizzOlfZ47LTjXJ2I/xQMspkefBQVXIRAZXnc15WgqLfTYfVms8BdHDo/YBVu7Dws/oWmstJq/ldhpdK0FgDTvJ+r4XN8rNUqN+CKUbYXSNG+KFnqNp1cfytlg2gDz8pUUewgfCfVDuuZOXJ2M3YYAAu1B4wOV4ZHlEKOEgoosNEkUoYKzSe5o2gD7oNo72oFSFyAEYKqS7hfa1d22LtV5xsBd4UseLMvWcAHJXM6xjDPJuHfnml0uteA1znfjyub1QeXvJx4AC3eP2O1ozZS0FrAOO/lVp7fGGMaSb7K47TuMnvfVp0TIWUGtLz8reppGWStmTDoXkkvBz2AsrQ0+kcz/w9O7GLctiHTTvYHbWxNIwTilEzdPFh0xce9HCrfkOToVY0jMlglPue5jQO1//AAqU0DyK9Vi059XomDaGuf2WdNqIqJbpwrcbk/QsqM17HMdk2fhMh1Ow08fYhLkfbyQzb9ksu3FaatbKLo2YdcLDixrye/BV2HqUXt9SB4d8cUuZa4tNXQViF2QXOIHIFqmeGLHU7OrEsBLHBgH7JjZdG6SnHPzwVysesljxZ23xaNmp9R+d1t4ys78b+j8kW5GEGqH3UxREU9zS6uPCuGQPkxEz28ZViLURsZ7mRiucIubrodwa7KJY+UbXONXdAK3o4pIrc62s4AJzSN3USxlRsY0/ZY2v6nK95Y19u7lCMZ5NUBtR2yeu6sSyemw8c0sf5Rkk245KFosgLbCChGkZ5Pk7CGAaXo2lzxjujfQG0J0UeWiuyLZEtmp02Y6eVpP0k5Xf9OmhkhaWkcchfPodrGNJ5HlX9NrJdOzdBI4eWnuuZ5OH5HaNuOWqPoDMmgBfZC5214N4XM6L9SOaA3UxluKsZCu/6xDqHMbFI0Dv2WCWGcXtDqJsRvLj4CsxjyOyqaWSN4+qwQrZNEUfhVsWf0GG4qvhC5ubCH1eARn4Xt1NzaNCKyNgpV52gjGUb5AD4CzOodRj07DbuDlRJt0i2KfZW1oabbgnwsDVPYx5ay3PPNdkeq6i6YuIcR8XlZOp1jmE7MebXQwYZLsWeX0i22Jl79Q8Y4AKKTqsGnDvRja0/AysJ+okfwbCQ5w5eT9gtiwX+xneT6NLUdWnndW4jxlU36iVxJcHE/OFVM7hhgDftyh3PJslXRxxj0hHkbGunkdY4SnPcTyChdusglCrEitsIk/ChQpRAeJvlHE4A07v38IF6h5UCnRYd9rCEtac3SbBTmHOW/yj9LeB7TXwq26L1FyVmzpw9lhzSSe4C85hAJdlPbMGndZoeUX9XG1x3EH7ttYbd9GmUHRlamT0o3HcLIoLJZmyVt9Z1MMsbQwM/ZlX+FiWNtBbMP62Y8vdEH6VLDRtQchQOArSobELlFrSia0Cncg2Vn6dw9TPZW5HhrgByeVXPbosiWHSAixgDH/f/fdC2YF5qwG4x3KRqH7GBoOSV6GQRRlpAIAyUnHQ3IvHUEU0DJRNDLFEtP3VLTOc+Tf8d1cBABDuBeB3of8AYVco0WLI2W4tRqIsxahwrgEq7F1fXsGZA4DyVjEkPcbROe5t+7FmlVLFF9osWU6Fn6i1TB7owcVymj9SE1cTgCuV9Y9zkNtSyci+5umpH40H6D8qOi1XXpHt2xtysXVaqRwL5nEDkE8/sq5la0kn3v8AA4v/AJVGaRznl8xu/wDElWYvHiuiqeVsstne8OMLA1vdzj/ys+WRu8lz95+OEM2ofINoNNHACr1lbIQoolOwzKTheYDI4DhC1hOAnRt21jJKfoUlmmD3DOCVEjQXO28DCtyuEUFf5HA+yq7SIrJ5KVOw0KkA3OCUU1wJkNAm/Cg6eUAFzdt8WmBQpSUwQuqzg3VHuUpEBN5Xl4gjkLyhBmnf6clq6ydm82Q2zhZ4GLVhsdAPGQRaSSTLsU5LSP/Z" > </img>'
  setup(c);
}

// setup(document.getElementById("canvas"));
