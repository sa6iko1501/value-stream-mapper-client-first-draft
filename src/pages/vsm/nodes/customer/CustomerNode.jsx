import { Handle, Position } from "@xyflow/react";
import CustomerCard from "./CustomerCard";
import { useTranslation } from "react-i18next";
import './CustomerNode.css'

function CustomerNode({ data }) {
    const { t } = useTranslation();
    const unit_name = data.customer_output?.unit;
    const takt = data.customer_output?.takt;
    const customers = data.customer_output?.customers || [];

    const getUnitDisplayName = (unitName) => {
        switch (unitName) {
            case "Kilogram": {
                return t("units.kg");
            }
            case "Piece": {
                return t("units.piece_full");
            }
            case "Pallet": {
                return t("units.pallet_full");
            }
            case "Cart": {
                return t("units.cart_full");
            }
            case "Hour": {
                return t("units.hour_full");
            }
            case "Number": {
                return "";
            }
            case "Day": {
                return t("units.day_full");
            }
            case "Second": {
                return t("units.second_full");
            }
            case "Percent": {
                return "%";
            }
        }
    }

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
            <div className="customer-node-section">
                <div className="customer-node-takt-section">
                    <span className="customer-node-label">{`${t("customer-card.takt")}:`}</span>
                    <span className="customer-node-value">{`${takt} ${t("customer-card.takt-per")} ${getUnitDisplayName(unit_name)}`}</span>
                </div>
            </div>
            <Handle type="source" position={Position.Left} />
            <Handle type="target" position={Position.Top} />
        </div>
    );
}

export default CustomerNode;