const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const delay : number = 20
const strokeFactor : number = 90
const sizeFactor : number = 5
const colors : Array<string> = ['#4a148c', '#880e4f', '#4caf50', '#ff6f00', '#01579b']
const midBlockColor : string = "#212121"
const backColor : string = "#BDBDBD"
const midBlockSizeFactor = 12
const parts : number = 3

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
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = colors[i]
        const sc1 : number = scale
        const sc2 : number = scale
        const sc3 : number = scale
        const size = Math.min(w, h) / sizeFactor
        context.save()
        context.rotate(-Math.PI / 2 * sc2)
        DrawingUtil.drawLine(context, 0, 0, 0, size * (sc1 - sc3))
        context.restore()
    }

    static drawRALNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const midBlockSize : number = Math.min(w, h) / midBlockSizeFactor
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

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
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
        this.state.update(cb)
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

    root : RALNode = new RALNode(0)
    curr : RALNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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
