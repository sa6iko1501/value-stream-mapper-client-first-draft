import { Handle, Position } from "@xyflow/react";
import SupplierCard from "./SupplierCard";
import { useTranslation } from "react-i18next";
import './SupplyNode.css';

function SupplyNode({ data }) {
    const {t} = useTranslation();
    const suppliers = data.supply?.suppliers || [];

    return (
        <div className="supplier-node">
            <div className="supplier-node-header">{t("supplier-card.title")}</div>
            <div className="supplier-node-cards">
                {suppliers.map(supplier => (
                    <SupplierCard
                        key={supplier.id}
                        id={supplier.id}
                        name={supplier.name}
                        unit_name={supplier.unit_name}
                        supply={supplier.supply}
                    />
                ))}
            </div>
            <Handle type="source" position={Position.Top} />
            <Handle type="target" position={Position.Right} />
        </div>
    );
}

export default SupplyNode;