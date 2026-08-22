import { Position, Handle } from "@xyflow/react";
import "./InventoryNode.css"

function InventoryNode({ data }) {
    return (
        <div className="inventory-node">
            <div className="inventory-node-triangle">
                <span className="inventory-node-letter">I</span>
            </div>
            <div className="inventory-node-label">{data.label}</div>
            <Handle type="source" position={Position.Left} />
            <Handle type="target" position={Position.Right} />
        </div>
    );
}

export default InventoryNode;