import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';

import './ProcessTableForm.css'

function SupplierForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { supplierId } = useParams();

    const { supply, vsmId } = location.state || {};

    const isEditMode = !!supplierId;

    const existingSupplier = isEditMode
        ? supply?.suppliers?.find(
            supplier => supplier.id === supplierId
        )
        : null;
    const { t } = useTranslation();

    const [name, setName] = useState(
        existingSupplier?.name || ""
    );

    const [supplierSupply, setSupplierSupply] = useState(
        existingSupplier?.supply ?? ""
    );

    if (!supply) {
        return (
            <div className="process-table-form">
                No supply data provided.
            </div>
        );
    }

    const validate = () => {
        const errors = [];

        if (!name.trim()) {
            errors.push("Supplier name is required.");
        }

        if (
            supplierSupply === "" ||
            supplierSupply === null ||
            supplierSupply === undefined
        ) {
            errors.push("Supply amount is required.");
        } else {
            const numericSupply = Number(
                String(supplierSupply).trim().replace(",", ".")
            );

            if (!Number.isFinite(numericSupply)) {
                errors.push("Supply must be a valid number.");
            }

            if (numericSupply < 0) {
                errors.push("Supply cannot be negative.");
            }
        }

        return errors;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();

        if (validationErrors.length > 0) {
            alert(validationErrors.join("\n"));
            return;
        }

        const numericSupply = Number(
            String(supplierSupply).trim().replace(",", ".")
        );

        let updatedSuppliers;

        if (isEditMode) {
            /*
             * Replace the existing supplier inside supply.suppliers.
             */
            updatedSuppliers = supply.suppliers.map((supplier) =>
                supplier.id === existingSupplier.id
                    ? {
                        ...supplier,
                        name: name.trim(),
                        supply: numericSupply,
                        unit_name: supply.unit
                    }
                    : supplier
            );
        } else {
            /*
             * Add a new supplier to supply.suppliers.
             */
            const newSupplier = {
                id: null,
                name: name.trim(),
                supply: numericSupply,
                unit_name: supply.unit
            };

            updatedSuppliers = [
                ...supply.suppliers,
                newSupplier
            ];
        }

        /*
         * Construct the complete SupplyDTO expected by the backend.
         */
        const supplyDto = {
            ...supply,
            suppliers: updatedSuppliers
        };


        try {
            if (isEditMode) {
                await Axios.put(
                    `http://localhost:8080/vsm/${vsmId}/supply/supplier`,
                    supplyDto);


            }
            else {
                await Axios.post(
                    `http://localhost:8080/vsm/${vsmId}/supply/supplier`,
                    supplyDto);
            }
            navigate(-1);
        } catch (err) {
            console.error(
                "Failed to save supplier:",
                err
            );
        }
    };

    return (
        <div className="process-table-form">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "var(--spacing-md)"
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
                    <h2>
                        {isEditMode
                            ? t("supplier-form.title")
                            : t("supplier-form.title-add")}
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>

                <div className="form-group">
                    <label>
                        {t("common.name", "Name")}:
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>
                        {t("supplier-form.supply", "Supply")}:
                    </label>

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
                    <label>
                        {t("edit-process-table.unit", "Unit")}:
                    </label>

                    <input
                        type="text"
                        value={supply.unit || ""}
                        disabled
                        className="form-input"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="save-btn"
                    >
                        {t("common.save", "Save")}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="cancel-btn"
                    >
                        {t("common.cancel", "Cancel")}
                    </button>
                </div>

            </form>
        </div>
    );
}

export default SupplierForm;