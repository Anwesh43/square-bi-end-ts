const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 4 
const scGap : number = 0.02 / parts   
const strokeFactor : number = 90 
const delay : number = 20 
const sizeFactor : number = 5.9 
const backColor : string = "#BDBDBD"
const colors : Array<string> = [
    "#f44336",
    "#FF9800",
    "#311B92",
    "#1B5E20",
    "#00C853"
]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, scale - i / n)
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

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0 , 2 * Math.PI)
        context.fill()
    }

    static drawSquareBiEnd(context : CanvasRenderingContext2D, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts) 
        const r : number = size / 10
        context.save()
        context.translate(w / 2, h / w)
        context.strokeRect(-size / 2, -size / 2, -size / 2 + size * sf1, -size / 2 + size * sf1)
        for (var j = 0; j < 2; j++) {
            const y : number = -(size / 2) * (1 - 2 * j)
            DrawingUtil.drawLine(context, 0, y, 0, y + (size / 2) * (1 - 2 * j) * sf2)
        }
        DrawingUtil.drawCircle(context, 0, 0, r * sf3,)
        context.restore()
    }

    static drawSBENode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        context.strokeStyle = colors[i]
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.lineCap = 'round'
        DrawingUtil.drawSquareBiEnd(context, scale)
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
    dir : number = 0 
    prevScale : number = 0 

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

class SBENode {

    state : State = new State()
    next : SBENode 
    prev : SBENode 

    constructor(private i : number) {
        
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new SBENode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawSBENode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SBENode {
        var curr : SBENode = this.prev 
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

class SquareBiEnd {

    curr : SBENode = new SBENode(0)
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

    curr : SquareBiEnd = new SquareBiEnd()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    handleTap(cb : Function) {
        this.curr.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.curr.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}