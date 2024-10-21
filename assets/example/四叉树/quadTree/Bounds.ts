import { math } from "cc";

export class Bounds {

    private x: number = 0;
    public get X(): number {
        return this.x;
    }
    public set X(v: number) {
        this.x = v;
    }
    public get MinX(): number {
        return this.x - this.width / 2;
    }
    public get MaxX(): number {
        return this.x + this.width / 2;
    }

    private y: number = 0;
    public get Y(): number {
        return this.y;
    }
    public set Y(v: number) {
        this.y = v;
    }
    public get MinY(): number {
        return this.y - this.height / 2;
    }
    public get MaxY(): number {
        return this.y + this.height / 2;
    }

    private width: number = 0;
    public get Width(): number {
        return this.width;
    }
    public set Width(v: number) {
        this.width = v;
    }

    private height: number = 0;
    public get Height(): number {
        return this.height;
    }
    public set Height(v: number) {
        this.height = v;
    }

    public get Origin(): math.Vec2 {
        return math.v2(this.x, this.y);
    }
    public set Origin(v: math.Vec2) {
        this.x = v.x;
        this.y = v.y;
    }

    public get Center(): math.Vec2 {
        return math.v2(this.x, this.y);
    }

    public get Size(): math.Size {
        return math.size(this.width, this.height);
    }

    public set Size(v: math.Size) {
        this.width = v.width;
        this.height = v.height;
    }

    public static Create(x: number, y: number, width: number, height: number): Bounds {
        let rect: Bounds = new Bounds();
        rect.x = x;
        rect.y = y;
        rect.width = width;
        rect.height = height;
        return rect;
    }

}
