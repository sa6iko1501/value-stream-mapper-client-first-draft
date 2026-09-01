import { Handle, Position } from "@xyflow/react";
import ProductionControlCard from "./ProductionControlCard";
import "./ProductionControlNode.css";
import { useTranslation } from "react-i18next";

function ProductionControlNode({ data }) {
    const {t} = useTranslation();
    const rows = data.productionControl?.rows || [];

    return (
        <div className="production-control-node">
            <div className="production-control-node-header">
                {t("production-control-card.title")}
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