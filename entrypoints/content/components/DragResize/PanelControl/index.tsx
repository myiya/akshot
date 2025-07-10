import React from "react";
import classNames from "classnames";
import { CONTROLICONS } from "@/utils/icon/icon";
import "./index.css";

const PanelControl = React.memo(() => {

    const [active, setActive] = React.useState<number | null>(null);

    const [step, setStep] = React.useState<number>(0);

    return (
        <div className="panel-control">
            {CONTROLICONS.map((it, i) => (
                <>
                    {i === 7 && <div className="panel-line"></div>}
                    <div className="panel-control-item" title={it.name} key={it.name}>
                        <span className={classNames('panel-icon iconfont', it.icon, {
                            'panel-active': active === i && i !== 7,
                            'panel-disabled': i === 7 && step === 0,
                        })} onClick={() => setActive(i)}></span>
                    </div>
                </>
            ))}
        </div>
    )
});

export default PanelControl;
