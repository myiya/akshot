import React from "react";
import { AkIcon, CONTROLICONS } from "@/utils/icon/icon";
import "./index.css";

const PanelControl = React.memo(() => {

    return (
        <div className="panel-control">
            {CONTROLICONS.map(it => (
                <div className="panel-control-item" key={it.name}>
                    <AkIcon className="panel-icon" type={it.icon} size={24} title={it.name} style={{
                        color: "#FFF"
                    }}></AkIcon>
                </div>
            ))}
        </div>
    )
});

export default PanelControl;
