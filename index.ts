const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 4
const scGap : number = 0.04
const delay : number = 20
const strokeFactor : number = 90
const sizeFactor : number = 5
const colors : Array<string> = ['#4a148c', '#880e4f', '#4caf50', '#ff6f00', '#01579b']
const midBlockColor : string = "#212121"
const backColor : string = "#BDBDBD"
const midBlockSizeFactor = 12


class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawRightAngleList(context : CanvasRenderingContext2D, i : number, scale : number) {
        const notLastBlock : boolean = i != colors.length - 1
        const currParts : number = notLastBlock ? parts : parts - 1
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = colors[i]
        const sc1 : number = ScaleUtil.divideScale(scale, 0, currParts)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, currParts)
        const sc3 : number = ScaleUtil.divideScale(scale, 2, currParts)
        const size = Math.min(w, h) / sizeFactor
        context.save()
        context.rotate((Math.PI) * sc2)
        DrawingUtil.drawLine(context, 0, 0, 0, size * (sc1 - sc3))
        if (notLastBlock) {
            const sc4 : number = ScaleUtil.divideScale(scale, 3, currParts)
            const midBlockSize : number = (Math.min(w, h) / midBlockSizeFactor) * sc4
            context.fillStyle = colors[i + 1]
            context.fillRect(-midBlockSize / 2, -midBlockSize / 2, midBlockSize, midBlockSize)
        }
        context.restore()
    }

    static drawRALNode(context : CanvasRenderingContext2D, i : number, scale : number) {

        const midBlockSize : number = Math.min(w, h) / midBlockSizeFactor
        context.fillStyle = colors[i]
        context.save()
        context.translate(w / 2, h / 2)
        context.fillRect(-midBlockSize / 2, -midBlockSize / 2, midBlockSize, midBlockSize)
        DrawingUtil.drawRightAngleList(context, i, scale)
        context.restore()
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(parts : number, cb : Function) {
        this.scale += (scGap / parts) * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RALNode {

    prev : RALNode
    next : RALNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new RALNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawRALNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(this.i != colors.length - 1 ? parts : parts - 1, cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RALNode {
        var curr : RALNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class RightAngledLine {

    curr : RALNode = new RALNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    ral : RightAngledLine = new RightAngledLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.ral.draw(context)
    }

    handleTap(cb : Function) {
        this.ral.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ral.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }

}
