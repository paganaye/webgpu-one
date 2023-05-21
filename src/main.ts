import './style.css'
import { setupWebGpu } from './webgpu'

setupWebGpu(document.getElementById('app') as HTMLDivElement, document.getElementById('canvas') as HTMLCanvasElement)


