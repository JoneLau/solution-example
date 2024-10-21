import { Graphics } from "cc";
import { Bounds } from "./Bounds";
import { QuadTreeObj } from "./QuadTreeObj";
import { QuadTreeUtil } from "./QuadTreeUtil";

export class QuadTree {

    /**四叉树能容纳的最大obj数量，超过则需要分裂 */
    private maxObjs: number = 5;
    /**四叉树的范围 */
    private bounds: Bounds = null;
    public get Bounds(): Bounds {
        return this.bounds;
    }
    /**四叉树中的obj */
    private objs: QuadTreeObj[] = [];
    /**分裂后的子四叉树 */
    private subQuadTrees: QuadTree[] = [];
    /**四叉树的级数,每次分裂产生的子四叉树级数+1,也就是树的深度 */
    private curLevel: number = 0;
    public get CurLevel(): number {
        return this.curLevel;
    }
    /**四叉树的最大级数(深度) */
    private maxlevel: number = 5;

    public static drawGraphics: Graphics = null;

    public static Create(bounds: Bounds, curLevel: number, maxLevel: number): QuadTree {
        let quadTree: QuadTree = new QuadTree();
        quadTree.bounds = bounds;
        quadTree.curLevel = curLevel;
        return quadTree;
    }

    /**清理四叉树 */
    public clear(): void {
        let ts = this;
        ts.objs = [];
        for (let i = 0; i < ts.subQuadTrees.length; i++) {
            const node = ts.subQuadTrees[i];
            node.clear();
        }
        ts.subQuadTrees = [];
    }

    /**
     * 四叉树分裂
     */
    public split(): void {
        let ts = this;
        let nextLevel: number = ts.curLevel + 1;
        let subWidth: number = ts.bounds.Width / 2;
        let subHeight: number = ts.bounds.Height / 2;
        let bounds: Bounds = ts.bounds;
        QuadTreeUtil.drawAxis(QuadTree.drawGraphics, ts);
        //第一象限
        ts.subQuadTrees[0] = QuadTree.Create(Bounds.Create(bounds.X + subWidth / 2, bounds.Y + subHeight / 2, subWidth, subHeight), nextLevel, ts.maxlevel);
        //第二象限
        ts.subQuadTrees[1] = QuadTree.Create(Bounds.Create(bounds.X - subWidth / 2, bounds.Y + subHeight / 2, subWidth, subHeight), nextLevel, ts.maxlevel);
        //第三象限
        ts.subQuadTrees[2] = QuadTree.Create(Bounds.Create(bounds.X - subWidth / 2, bounds.Y - subHeight / 2, subWidth, subHeight), nextLevel, ts.maxlevel);
        //第四象限
        ts.subQuadTrees[3] = QuadTree.Create(Bounds.Create(bounds.X + subWidth / 2, bounds.Y - subHeight / 2, subWidth, subHeight), nextLevel, ts.maxlevel);
    }

    /**获取指定obj所在的象限 */
    public getQuadrants(obj: QuadTreeObj): number[] {
        let ts = this;
        let bounds: Bounds = ts.bounds;
        let centerX: number = bounds.Center.x;
        let centerY: number = bounds.Center.y;
        let objBounds: Bounds = obj.Bounds;
        let isUp = objBounds.Y + objBounds.Height / 2 > centerY;
        let isRight = objBounds.X + objBounds.Width / 2 > centerX;
        let isDown = objBounds.Y - objBounds.Height / 2 < centerY;
        let isLeft = objBounds.X - objBounds.Width / 2 < centerX;
        let arr: number[] = [];
        if (isRight && isUp) {//第一象限
            arr.push(0);
        }
        if (isLeft && isUp) {//第二象限
            arr.push(1);
        }
        if (isLeft && isDown) {//第三象限
            arr.push(2);
        }
        if (isDown && isRight) {//第四象限
            arr.push(3);
        }
        return arr;
    }

    /**将obj插入四叉树 */
    public insert(obj: QuadTreeObj): void {
        if (!obj) return;
        let ts = this;
        //如果有子树，则将obj插入子树中
        if (ts.subQuadTrees.length > 0) {
            let quadrants: number[] = ts.getQuadrants(obj);
            if (quadrants.length > 0) {
                for (let i = 0; i < quadrants.length; i++) {
                    const index: number = quadrants[i];
                    ts.subQuadTrees[index].insert(obj);
                }
                return;
            }
        }
        //否则，插入当前树中
        ts.objs.push(obj);
        //若插入后超过限制
        if (ts.objs.length > ts.maxObjs && ts.curLevel < ts.maxlevel) {
            //则分裂
            if (ts.subQuadTrees.length <= 0) {
                ts.split();
            }
            //并将当前树的obj全部移至子树中
            for (let i = 0; i < ts.objs.length; i++) {
                let obj: QuadTreeObj = ts.objs[i];
                let quadrants: number[] = ts.getQuadrants(obj);
                for (var j = 0; j < quadrants.length; j++) {
                    const index: number = quadrants[j];
                    ts.subQuadTrees[index].insert(obj);
                }
            }
            ts.objs = [];
        }
    }

    /**筛选出需要与指定obj检测碰撞的obj,并保存在retrievedObj中 */
    public retrieve(retrievedObj: QuadTreeObj[], obj: QuadTreeObj) {
        let ts = this;
        if (!obj) return null;
        if (ts.subQuadTrees.length > 0) {
            let quadrants: number[] = ts.getQuadrants(obj);
            //对obj所对应象限的四叉树进行递归筛选
            if (quadrants.length > 0) {
                for (let i = 0; i < quadrants.length; i++) {
                    const index = quadrants[i];
                    ts.subQuadTrees[index].retrieve(retrievedObj, obj);
                }
            }
        }
        //直到四叉树的最深层
        for (let i = 0; i < ts.objs.length; i++) {
            const obj = ts.objs[i];
            retrievedObj.push(obj);
        }
        return retrievedObj;
    }
}
