import { Graphics, math } from "cc";
import { QuadTree } from "./QuadTree";

export class QuadTreeUtil {
    static drawAxis(graphic: Graphics, quadTree: QuadTree): void {
        graphic.lineWidth = 5 - quadTree.CurLevel;
        if(graphic.lineWidth < 2) graphic.lineWidth = 2;
        graphic.moveTo(quadTree.Bounds.MinX, quadTree.Bounds.Y);
        graphic.lineTo(quadTree.Bounds.MaxX, quadTree.Bounds.Y);
        graphic.moveTo(quadTree.Bounds.X, quadTree.Bounds.MaxY);
        graphic.lineTo(quadTree.Bounds.X, quadTree.Bounds.MinY);
        graphic.stroke();
    }

    static drawBorder(graphic: Graphics, quadTree: QuadTree): void {
        graphic.moveTo(quadTree.Bounds.MinX, quadTree.Bounds.MaxY);
        graphic.lineTo(quadTree.Bounds.MaxX, quadTree.Bounds.MaxY);
        graphic.lineTo(quadTree.Bounds.MaxX, quadTree.Bounds.MinY);
        graphic.lineTo(quadTree.Bounds.MinX, quadTree.Bounds.MinY);
        graphic.lineTo(quadTree.Bounds.MinX, quadTree.Bounds.MaxY);
        graphic.stroke();
    }
}
