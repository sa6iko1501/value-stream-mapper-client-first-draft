import './CustomerCard.css'
import { useTranslation } from "react-i18next";

function CustomerCard({ id, unit_name, daily_required_output, name }) {

    const { t } = useTranslation();

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
        <div className="customer-card">
            <div className="customer-card-row">
                <span className="customer-card-label">{`${t("common.name")}:`}</span>
                <span className="customer-card-value">{name}</span>
            </div>
            <div className="customer-card-row">
                <span className="customer-card-label">{`${t("customer-card.unit")}:`}</span>
                <span className="customer-card-value">{getUnitDisplayName(unit_name)}</span>
            </div>
            <div className="customer-card-row">
                <span className="customer-card-label">{`${t("customer-card.daily-req")}:`}</span>
                <span className="customer-card-value">{daily_required_output}</span>
            </div>
        </div>
    );
}

export default CustomerCard;