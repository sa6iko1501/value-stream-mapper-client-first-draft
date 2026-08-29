import "./ProductionControlCard.css";

function ProductionControlCard({ id, row_name }) {
    return (
        <div className="production-control-card">
            <div className="production-control-card-row">
                <span className="production-control-card-label">
                    {row_name}:
                </span>
            </div>
        </div>
    );
}

export default ProductionControlCard;