// inspired originally by Tim Holman
// Bezier curve simulator
// https://codepen.io/tholman/pen/kKKVxB?editors=0010

interface Point {
  x: number; y: number, name?: string
}
class BezierTriangle {
  private context: CanvasRenderingContext2D;
  private mouseDown = false;
  mouse = {
    x: 0,
    y: 0,
  };
  selected: any;
  points: Point[] = [];

  constructor(readonly canvas: HTMLCanvasElement) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.selected = null;

    this.context = canvas.getContext("2d")!;

    // Set canvas to full screen.
    canvas.width = width;
    canvas.height = height;
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
  }

  // Render the key points of the curve
  renderPoints() {
    this.canvas.width = this.canvas.width;
    for (let i = 0; i < this.points.length; i++) {
      // Large points
      let point1 = this.points[i]
      this.drawPoint(point1, 2);
      this.drawPoint(point1, i & 1 ? 12 : 5);
      if (point1.name) {
        this.context.fillText(point1.name, point1.x + 15, point1.y)
      }
      this.context.lineWidth = 0.2;
      let point2 = this.points[(i + 1) % this.points.length]
      this.context.beginPath();
      this.context.moveTo(point1.x, point1.y);
      this.context.lineTo(point2.x, point2.y);
      this.context.stroke();
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
    this.renderPoints();
    this.drawFatTriangle(this.points);
  }

  drawFatTriangle(p: Point[]) {

    this.drawThinTriangle([
      p[0], p[1], p[2], p[3], p[4], p[5]
    ])
    this.drawThinTriangle([
      p[0], p[1], p[2], p[3], p[4], p[5]
    ])
  }

  drawThinTriangle(p: Point[]) {
    this.drawArc(p[0], p[1], p[2]);
    this.drawArc(p[2], p[3], p[4]);
    this.drawArc(p[4], p[5], p[0]);
  }

  midPoint(p0: Point, p1: Point): Point {
    return { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
  }


  drawArc(p0: Point, p1: Point, p2: Point) {
    let a = this.midPoint(p0, p1)
    let b = this.midPoint(p1, p2)
    let m = this.midPoint(a, b)

    this.context.beginPath();
    this.context.arc(m.x, m.y, 2, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.fill();
    const dx = p0.x - p2.x;
    const dy = p0.y - p2.y;
    const sqrDist = dx * dx + dy * dy;

    if (sqrDist > 25) {
      this.drawArc(p0, a, m)
      this.drawArc(m, b, p2)
    }
  }



  // ------------------------------------------------------------------------------
  // Loading data / Saving data
  // ------------------------------------------------------------------------------

  // TODO: Learn the proper regex method
  // Load data string.
  loadData(data: Point[]) {
    this.points = data;
  }

  // Moving/Creating/Deleting points
  onMouseUp(_event: MouseEvent) {
    this.mouseDown = false;
    this.selected = null;
    console.log("points=", JSON.stringify(this.points.map((p) => [p.x, p.y])));
  }

  onMouseMove(event: any) {
    this.mouse.x = event.offsetX || event.layerX - this.canvas.offsetLeft;
    this.mouse.y = event.offsetY || event.layerY - this.canvas.offsetTop;

    if (this.mouseDown && this.selected != null) {
      this.points[this.selected].x = this.mouse.x;
      this.points[this.selected].y = this.mouse.y;
      this.draw();

    }
  }

  onMouseDown(event: MouseEvent) {
    // Prevent dragging of points from confusing the screen.
    event.preventDefault();

    this.mouseDown = true;
    for (let i = 0; i < this.points.length; i++) {
      const dx = this.points[i].x - this.mouse.x;
      const dy = this.points[i].y - this.mouse.y;
      const sqrDist = dx * dx + dy * dy;

      // You may now drag selected point
      if (sqrDist < 30 * 30) {
        if (this.selected === null) {
          this.selected = i;
        }
      }
    }
  }
}


export async function setupWebGpu(canvas: HTMLCanvasElement, _output: HTMLDivElement) {

  setTimeout(function () {
    const bezierTriangle = new BezierTriangle(canvas);
    bezierTriangle.loadData([
      { x: 308, y: 816, name: "0" },
      { x: 137, y: 613, name: "1" },
      { x: 176, y: 397, name: "2" },
      { x: 419, y: 194, name: "3" },
      { x: 643, y: 429, name: "4" },
      { x: 638, y: 678, name: "5" }
    ]);
    bezierTriangle.draw();
  });

  /**
   * Provides requestAnimationFrame in a cross browser way.
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
      return (
        window.requestAnimationFrame ||
        function (/* function */ callback: any, /* DOMElement */ _element: any) {
          return window.setTimeout(callback, 1000 / 60);
        }
      );
    })();
  }

}

