import { Handle, Position } from "@xyflow/react";
import ProductionControlCard from "./ProductionControlCard";
import "./ProductionControlNode.css";

function ProductionControlNode({ data }) {
    const rows = data.productionControl?.rows || [];

    return (
        <div className="production-control-node">
            <div className="production-control-node-header">
                Production Control
            </div>

            <div className="production-control-node-cards">
                {rows.map(row => (
                    <ProductionControlCard
                        key={row.id}
                        id={row.id}
                        row_name={row.row_name}
                    />
                ))}
            </div>

            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </div>
    );
}

export default ProductionControlNode;