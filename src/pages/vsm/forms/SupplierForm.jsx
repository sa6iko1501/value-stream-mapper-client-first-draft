import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';

import './ProcessTableForm.css'

function SupplierForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const supplier = location.state?.supplier;
    const supply = location.state?.supply;
    const vsmId = location.state?.vsmId;

    const [name, setName] = useState(supplier?.name || '');
    const [unitName, setUnitName] = useState(
        supplier?.unit_name || ''
    );
    const [supplierSupply, setSupplierSupply] = useState(
        supplier?.supply ?? ''
    );

    if (!supplier || !supply) {
        return (
            <div className="supplier-form">
                No supplier data provided.
            </div>
        );
    }

    const validateSupplier = () => {
        const errors = [];

        if (!name.trim()) {
            errors.push('Supplier name is required.');
        }

        if (!unitName.trim()) {
            errors.push('Unit name is required.');
        }

        if (
            supplierSupply === '' ||
            supplierSupply === null ||
            supplierSupply === undefined
        ) {
            errors.push('Supply amount is required.');
        }

        const numericSupply = Number(
            String(supplierSupply).trim().replace(',', '.')
        );

        if (!Number.isFinite(numericSupply)) {
            errors.push('Supply must be a valid number.');
        }

        if (numericSupply < 0) {
            errors.push('Supply cannot be negative.');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateSupplier();

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        const updatedSupplier = {
            ...supplier,
            name,
            unit_name: unitName,
            supply: Number(
                String(supplierSupply).replace(',', '.')
            )
        };

        const updatedSupply = {
            ...supply,
            suppliers: supply.suppliers.map(currentSupplier =>
                currentSupplier.id === supplier.id
                    ? updatedSupplier
                    : currentSupplier
            )
        };;

        try {
            await Axios.put(
                `http://localhost:8080/vsm/${vsmId}/supply/supplier`,
                updatedSupply
            );

            navigate(-1);
        } catch (err) {
            console.error(
                'Failed to update supplier:',
                err
            );
        }
    };

    return (
        <div className="process-table-form">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-md)'
                }}
            >
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                    ←
                </button>

                <div className="process-table-form-title">
                    <h2>{t("supplier-form.title")}</h2>
                </div>
            </div>


            <form onSubmit={handleSubmit} noValidate>

                <div className="form-group">
                    <label>{`${t("common.name")}:`}</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>{`${t("supplier-form.supply")}:`}</label>

                    <input
                        type="number"
                        value={supplierSupply}
                        onChange={(e) =>
                            setSupplierSupply(e.target.value)
                        }
                        min="0"
                        step="any"
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>{`${t("edit-process-table.unit")}:`}</label>

                    <input
                        type="text"
                        value={unitName}
                        disabled
                        className="form-input readonly-input"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="save-btn"
                    >
                        {t('common.save')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="cancel-btn"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SupplierForm;