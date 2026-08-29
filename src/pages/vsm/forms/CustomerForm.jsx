import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';

import './ProcessTableForm.css'

function CustomerForm(){
    const navigate = useNavigate();
    const location = useLocation();
    const { customerId } = useParams();

    const { customerOutput, vsmId } = location.state || {};

    const isEditMode = !!customerId;

    const existingCustomer = isEditMode
        ? customerOutput?.customers?.find(
            customer => customer.id === customerId
        )
        : null;
    const { t } = useTranslation();

    const [name, setName] = useState(
        existingCustomer?.name || ""
    );

    const [customerDailyReq, setCustomerDailyReq] = useState(
        existingCustomer?.daily_required_output ?? ""
    );

    if (!customerOutput) {
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
            customerDailyReq === "" ||
            customerDailyReq === null ||
            customerDailyReq === undefined
        ) {
            errors.push("Customer daily requirement is required.");
        } else {
            const numericDailyReq = Number(
                String(customerDailyReq).trim().replace(",", ".")
            );

            if (!Number.isFinite(numericDailyReq)) {
                errors.push("Daily requirement must be a valid number.");
            }

            if (numericDailyReq < 0) {
                errors.push("Daily requirement cannot be negative.");
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

        const numericDailyReq = Number(
            String(customerDailyReq).trim().replace(",", ".")
        );

        let updatedCustomers;

        if (isEditMode) {
            updatedCustomers = customerOutput.customers.map((customer) =>
                customer.id === existingCustomer.id
                    ? {
                        ...customer,
                        name: name.trim(),
                        daily_required_output: numericDailyReq,
                        unit_name: customerOutput.unit
                    }
                    : customer
            );
        } else {
            const newCustomer = {
                id: null,
                name: name.trim(),
                daily_required_output: numericDailyReq,
                unit_name: customerOutput.unit
            };

            updatedCustomers = [
                ...customerOutput.customers,
                newCustomer
            ];
        }
        const customerOutputDTO = {
            ...customerOutput,
            customers: updatedCustomers
        };


        try {
            if (isEditMode) {
                await Axios.put(
                    `http://localhost:8080/vsm/${vsmId}/customer-output/customer`,
                    customerOutputDTO);
                    


            }
            else {
                await Axios.post(
                    `http://localhost:8080/vsm/${vsmId}/customer-output/customer`,
                    customerOutputDTO);
                    
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
                            ? t("customer-form.title")
                            : t("customer-form.title-add")}
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
                        {t("customer-form.daily-req")}:
                    </label>

                    <input
                        type="number"
                        value={customerDailyReq}
                        onChange={(e) =>
                            setCustomerDailyReq(e.target.value)
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
                        value={customerOutput.unit || ""}
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

export default CustomerForm;