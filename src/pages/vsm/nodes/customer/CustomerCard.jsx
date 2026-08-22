import './CustomerCard.css' 

function CustomerCard({ id, unit_name, daily_required_output, name }) {

    return (
        <div className="customer-card">
            <div className="customer-card-row">
                <span className="customer-card-label">Name:</span>
                <span className="customer-card-value">{name}</span>
            </div>
            <div className="customer-card-row">
                <span className="customer-card-label">Unit:</span>
                <span className="customer-card-value">{unit_name}</span>
            </div>
            <div className="customer-card-row">
                <span className="customer-card-label">Daily Requirement:</span>
                <span className="customer-card-value">{daily_required_output}</span>
            </div>
        </div>
    );
}

export default CustomerCard;