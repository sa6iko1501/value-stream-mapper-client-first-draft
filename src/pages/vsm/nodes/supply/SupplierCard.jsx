import './SupplierCard.css';

function SupplierCard({ id, unit_name, supply, name }) {
  return (
    <div className="supplier-card">
      <div className="supplier-card-row">
        <span className="supplier-card-label">Name:</span>
        <span className="supplier-card-value">{name}</span>
      </div>
      <div className="supplier-card-row">
        <span className="supplier-card-label">Unit:</span>
        <span className="supplier-card-value">{unit_name}</span>
      </div>
      <div className="supplier-card-row">
        <span className="supplier-card-label">Daily Supply:</span>
        <span className="supplier-card-value">{supply}</span>
      </div>
    </div>
  );
}

export default SupplierCard;