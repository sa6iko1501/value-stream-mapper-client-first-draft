import { Handle, Position } from "@xyflow/react";
import SupplierCard from "./SupplierCard";
import './SupplyNode.css';

function SupplyNode({ data }) {
    const suppliers = data.supply?.suppliers || [];

    return (
        <div className="supplier-node">
            <div className="supplier-node-header">Suppliers</div>
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
            <Handle type="source" position={Position.Left} />
            <Handle type="target" position={Position.Right} />
        </div>
    );
}

export default SupplyNode;