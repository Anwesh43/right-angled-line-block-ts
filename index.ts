const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const delay : number = 20
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const colors : Array<string> = ['#4a148c', '#880e4f', '#4caf50', '#ff6f00', '#01579b']
const midBlockColor : string = "#212121"
const backColor : string = "#BDBDBD"
const parts : number = 3

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }

}
