import { _decorator, Component, Graphics, Node } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('graphic')
@executeInEditMode(true)
export class graphic extends Component {
    @property(Node)
    cube: Node;

    graphicComp: Graphics;
    onEnable() {
        this.graphicComp = this.getComponent(Graphics);
        // this.graphicComp.lineWidth = 10;
        // this.graphicComp.moveTo(-250, 200);
        // this.graphicComp.lineTo(-100, 200);
        // this.graphicComp.lineTo(0, 400);
        // this.graphicComp.lineTo(100, 200);
        // this.graphicComp.lineTo(250, 200);
        // this.graphicComp.lineTo(120, 0);
        // this.graphicComp.lineTo(180, -200);
        // this.graphicComp.lineTo(0, -50);
        // this.graphicComp.lineTo(-180, -200);
        // this.graphicComp.lineTo(-120, 0);
        // this.graphicComp.lineTo(-250, 200);
        // this.graphicComp.close();
        // this.graphicComp.stroke();
    }
}
