import { Handle, Position } from "@xyflow/react";
import CustomerCard from "./CustomerCard";
import { useTranslation } from "react-i18next";
import './CustomerNode.css'

function CustomerNode({ data }) {
    const {t} = useTranslation();
    const customers = data.customer_output?.customers || [];

    return (
        <div className="customer-node">
            <div className="customer-node-header">{t("customer-card.title")}</div>
            <div className="customer-node-cards">
                {customers.map(customer => (
                    <CustomerCard
                        key={customer.id}
                        id={customer.id}
                        name={customer.name}
                        unit_name={customer.unit_name}
                        daily_required_output={customer.daily_required_output}
                    />
                ))}
            </div>
            <Handle type="source" position={Position.Left} />
            <Handle type="target" position={Position.Top} />
        </div>
    );
}

export default CustomerNode;