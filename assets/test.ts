import { _decorator, Component, macro } from 'cc';
import { CustomSprite } from './example/dynamicCreateVertice/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    rows = [8, 6, 9];

    start() {
        let idx = 0;
        let custom = this.getComponent(CustomSprite);
        this.schedule(() => {
            custom.vertRows = this.rows[idx];
            idx = (idx + 1) % this.rows.length;
        }, 3, macro.REPEAT_FOREVER, 2);
    }
}
