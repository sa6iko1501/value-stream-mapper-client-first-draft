import './SupplierCard.css';
import { useTranslation } from "react-i18next";

function SupplierCard({ id, unit_name, supply, name }) {
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
    <div className="supplier-card">
      <div className="supplier-card-row">
        <span className="supplier-card-label">{`${t("common.name")}:`}</span>
        <span className="supplier-card-value">{name}</span>
      </div>
      <div className="supplier-card-row">
        <span className="supplier-card-label">{`${t("supplier-card.unit")}:`}</span>
        <span className="supplier-card-value">{getUnitDisplayName(unit_name)}</span>
      </div>
      <div className="supplier-card-row">
        <span className="supplier-card-label">{`${t("supplier-card.daily-supply")}:`}</span>
        <span className="supplier-card-value">{supply}</span>
      </div>
    </div>
  );
}

export default SupplierCard;