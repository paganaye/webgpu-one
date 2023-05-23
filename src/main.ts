import './style.css'

let menu = document.getElementById('menu') as HTMLDivElement
let canvas = document.getElementById('canvas') as HTMLCanvasElement
let output = document.getElementById('output') as HTMLCanvasElement


let pages = ["triangle", "particles", "game-of-life", "boids", "compute-rasterizer", "test"];
let page = document.location.hash
if (page[0] == '#') page = page.substring(1);
else document.location.hash = "#triangle";

pages.forEach(p => {
  if (p == page) {
    menu.append(p)
  } else {
    let link = document.createElement("a");
    link.href = "#" + p;
    link.innerText = p;
    menu.append(link)
  }
  menu.append(" ")
})

window.onhashchange = () => document.location.reload();

try {
  let module = await import("./" + page + "/main.ts");
  console.log(module, typeof module);
  if (typeof module === 'object') {
    module.setupWebGpu(canvas, output);
  }
} catch (error) {
  output.append(error as string);
}
