import React from "react";
import classNames from "classnames";
import { CONTROLICONS } from "@/utils/icon/icon";
import "./index.css";

import { DragControlContext } from "@/entrypoints/content/container/DragControlContainer";

const PanelControl = React.memo(() => {

    const { activeControl, setActiveControl, step, handleCaptureClose } = useContext(DragControlContext);

    const handleActClick = useCallback((i: number) => {
        switch (i) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                // 启动 canvas截图, 截图框位置大小就不能移动了
                break;
            case 7:
                // 撤销
                break;
            case 8:
                // 下载
                break;
            case 9:
                // 关闭
                handleCaptureClose();
                break;
            case 10:
                // 保存
                break;
            default:
                break;
        }

        setActiveControl(i);
    }, []);

    return (
        <div className="panel-control">
            {CONTROLICONS.map((it, i) => (
                <React.Fragment key={it.id}>
                    {i === 7 && <div className="panel-line"></div>}
                    <div className="panel-control-item" title={it.name}>
                        <span className={classNames('panel-icon iconfont', it.icon, {
                            'panel-active': activeControl === i && i !== 7,
                            'panel-disabled': i === 7 && step === 0,
                        })} onClick={() => handleActClick(it.id)}></span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    )
});

export default PanelControl;
