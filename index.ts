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