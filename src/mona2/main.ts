// inspired originally by Tim Holman
// Bezier curve simulator
// https://codepen.io/tholman/pen/kKKVxB?editors=0010
import * as dat from "dat.gui"

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
  projectionMatrix: number[][] = [];
  camZ = 50;
  imageData: any;

  constructor(readonly canvas: HTMLCanvasElement, readonly points: Point[], readonly img: HTMLImageElement) {
    this.points = points;
    let gui = new dat.GUI();
    for (let i = 0; i < 9; i++) {
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

    var imgCanvas = document.createElement("canvas");

    // Set the canvas dimensions to match the image
    imgCanvas.width = 256;
    imgCanvas.height = 256;
    var imgCtx = imgCanvas.getContext("2d")!;
    imgCtx.drawImage(img, 0, 0);
    this.imageData = imgCtx.getImageData(0, 0, 256, 256);
    // Get the pixel data array
  }

  getPixel(x: any, y: any) {
    var data = this.imageData.data;

    // // Calculate the index of the pixel in the data array
    var index = (y * this.imageData.width + x) * 4;

    // Read the RGB values of the pixel
    var r = data[index];
    var g = data[index + 1];
    var b = data[index + 2];
    // var alpha = data[index + 3];
    return { r, g, b };
  }

  resize() {
    this.canvasWidth = this.canvas.width = window.innerWidth - 400;
    this.canvasHeight = this.canvas.height = window.innerHeight - 200;
    console.log({
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight
    });
  }

  project(pt: Point): Point {
    let canvasZ = pt.z + this.camZ;
    let zoom = 150 / canvasZ;
    let canvasX = (this.canvasWidth - 245) / 2 + pt.x * zoom;
    let canvasY = this.canvasHeight / 2 + pt.y * zoom;
    return { x: canvasX, y: canvasY, z: canvasZ, name: pt.name };
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

    //this.drawQuadraticBezierSurface(this.points);
    this.drawQuadraticBezierSurfaceRecursive(this.points);
    this.renderPoints();
  }

  // this was the first attempt.
  // it is not ideal because it is hard to determine the right step value
  // too small and it is very slow
  // too high and you see white patches
  drawQuadraticBezierSurface(p: Point[]) {
    let p0: Point = p[0];
    let p1: Point = p[1];
    let p2: Point = p[2];
    let p3: Point = p[3];
    let p4: Point = p[4];
    let p5: Point = p[5];
    let p6: Point = p[6];
    let p7: Point = p[7];
    let p8: Point = p[8];
    let v = 0;
    this.context.lineWidth = 1.5;
    let step = 1 / 256;

    while (v <= 1) {
      let vSqr = v * v;
      let mv = 1 - v;
      let mvSqr = mv * mv;
      let tmvv = 2 * mv * v;

      let u = 0;
      while (u <= 1) {
        let uSqr = u * u;
        let mu = 1 - u;
        let tmuu = 2 * mu * u;
        let muSqr = mu * mu;
        let x, y, z;

        let xh = muSqr * p0.x + tmuu * p1.x + uSqr * p2.x;
        let yh = muSqr * p0.y + tmuu * p1.y + uSqr * p2.y;
        let zh = muSqr * p0.z + tmuu * p1.z + uSqr * p2.z;

        let xm = muSqr * p3.x + tmuu * p4.x + uSqr * p5.x;
        let ym = muSqr * p3.y + tmuu * p4.y + uSqr * p5.y;
        let zm = muSqr * p3.z + tmuu * p4.z + uSqr * p5.z;

        let xl = muSqr * p6.x + tmuu * p7.x + uSqr * p8.x;
        let yl = muSqr * p6.y + tmuu * p7.y + uSqr * p8.y;
        let zl = muSqr * p6.z + tmuu * p7.z + uSqr * p8.z;

        x = mvSqr * xh + tmvv * xm + vSqr * xl;
        y = mvSqr * yh + tmvv * ym + vSqr * yl;
        z = mvSqr * zh + tmvv * zm + vSqr * zl;

        let pt = this.project({ x, y, z });
        if (pt) {
          let { r, g, b } = this.getPixel(u * 256, v * 256);
          this.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
          this.context.fillRect(pt.x, pt.y, 2, 2);
        }
        u += step;
      }
      v += step;
    }
  }


  // this is the second attempt.
  drawQuadraticBezierSurfaceRecursive(p: Point[]) {
    let p0: Point = this.project(p[0]);
    let p1: Point = this.project(p[1]);
    let p2: Point = this.project(p[2]);
    let p3: Point = this.project(p[3]);
    let p4: Point = this.project(p[4]);
    let p5: Point = this.project(p[5]);
    let p6: Point = this.project(p[6]);
    let p7: Point = this.project(p[7]);
    let p8: Point = this.project(p[8]);

    let calcPt = (u: number, v: number) => {
      let uSqr = u * u;
      let mu = 1 - u;
      let muSqr = mu * mu;
      let tmuu = 2 * mu * u;

      let vSqr = v * v;
      let mv = 1 - v;
      let mvSqr = mv * mv;
      let tmvv = 2 * mv * v;

      let x0 = muSqr * p0.x + tmuu * p1.x + uSqr * p2.x;
      let y0 = muSqr * p0.y + tmuu * p1.y + uSqr * p2.y;
      let z0 = muSqr * p0.z + tmuu * p1.z + uSqr * p2.z;

      let x1 = muSqr * p3.x + tmuu * p4.x + uSqr * p5.x;
      let y1 = muSqr * p3.y + tmuu * p4.y + uSqr * p5.y;
      let z1 = muSqr * p3.z + tmuu * p4.z + uSqr * p5.z;

      let x2 = muSqr * p6.x + tmuu * p7.x + uSqr * p8.x;
      let y2 = muSqr * p6.y + tmuu * p7.y + uSqr * p8.y;
      let z2 = muSqr * p6.z + tmuu * p7.z + uSqr * p8.z;

      return {
        x: mvSqr * x0 + tmvv * x1 + vSqr * x2,
        y: mvSqr * y0 + tmvv * y1 + vSqr * y2,
        z: mvSqr * z0 + tmvv * z1 + vSqr * z2
      };
    }
    let drawPixel = (u: number, v: number): Point => {
      let pt = calcPt(u, v)
      if (pt.z > 0) {
        let { r, g, b } = this.getPixel(u * 256 | 0, v * 256 | 0);
        this.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.context.fillRect(pt.x, pt.y, 2, 2);
      }
      return pt
    }

    const d = 2.0;

    let fillArea = (lvl: number, minU: number, maxU: number, minV: number, maxV: number, pt0: Point, pt2: Point, pt6: Point, pt8: Point) => {
      let xMin = Math.min(pt0.x, pt2.x, pt6.x, pt8.x)
      let xMax = Math.max(pt0.x, pt2.x, pt6.x, pt8.x)
      let yMin = Math.min(pt0.y, pt2.y, pt6.y, pt8.y)
      let yMax = Math.max(pt0.y, pt2.y, pt6.y, pt8.y)

      if ((Math.abs(xMax - xMin) >= d
        || Math.abs(yMax - yMin) >= d)) {
        let midU = (minU + maxU) / 2
        let midV = (minV + maxV) / 2

        let pt1 = drawPixel(midU, minV)
        let pt3 = drawPixel(minU, midV)
        let pt4 = drawPixel(midU, midV)
        let pt5 = drawPixel(maxU, midV)
        let pt7 = drawPixel(midU, maxV)

        fillArea(lvl + 1, minU, midU, minV, midV, pt0, pt1, pt3, pt4)
        fillArea(lvl + 1, midU, maxU, minV, midV, pt1, pt2, pt4, pt5)
        fillArea(lvl + 1, minU, midU, midV, maxV, pt3, pt4, pt6, pt7)
        fillArea(lvl + 1, midU, maxU, midV, maxV, pt4, pt5, pt7, pt8)

      }
    }
    fillArea(/*lvl*/ 0, /*minU*/ 0, /*maxU*/ 1, /*minV*/ 0, /*maxV*/ 1,
      drawPixel(0, 0), drawPixel(1, 0), drawPixel(0, 1), drawPixel(1, 1))
  }
}



export function setupWebGpu(canvas: HTMLCanvasElement, output: HTMLDivElement) {
  output.innerHTML = '<img style="display:none;" id="mona" src="/mona-lisa-square.jpg" />'
  // debugger;

  setTimeout(() => {
    let img = document.getElementById("mona") as HTMLImageElement;
    img.onload = () => {
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
      ], img);
      setInterval(() => bezierQuad.draw(), 250);
    };
  })
}
