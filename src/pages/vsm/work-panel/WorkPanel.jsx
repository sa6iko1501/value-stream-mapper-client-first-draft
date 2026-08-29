import './WorkPanel.css'
import { useNavigate } from 'react-router'
import { useTranslation } from "react-i18next";
import Axios from 'axios';

function WorkPanel({ processTables, unitId, vsmId, supply, customerOutput }) {
    const navigate = useNavigate();
    const { t } = useTranslation()

    if (Object.entries(processTables).length === 0) {
        return (
            <div className='work-panel'>
                <h3>{t("common.loading") || "Loading..."}</h3>
            </div>
        );
    }

    const processTablesCount = Object.entries(processTables).length;

    const handleTableClick = (tableId) => {
        const table = Object.values(processTables).find(t => t.id === tableId);
        navigate(`/edit-process-table/${tableId}`, { state: { table } });
    }

    const handleDeleteTableClick = async (tableId) => {
        try {
            if (processTablesCount > 1) {
                await Axios.delete(`http://localhost:8080/table/${tableId}`);

                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to delete table:", err);
        }
    };

    const handleSupplierClick = (supplierId) => {
        navigate(`/supplier/${supplierId}/edit`, {
            state: {
                supply,
                vsmId
            }
        });
    };

    const handleDeleteSupplierClick = async (supplierId) => {
        try {
            if (supply.suppliers.length > 1) {
                await Axios.delete(`http://localhost:8080/vsm/${vsmId}/supply/supplier/${supplierId}`);
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to delete supplier:", err);
        }
    }

     const handleCustomerClick = (customerId) => {
        navigate(`/customer/${customerId}/edit`, {
            state: {
                customerOutput,
                vsmId
            }
        });
    };

    const handleDeleteCustomerClick = async (customerId) => {
        try {
            if (customerOutput.customers.length > 1) {
                await Axios.delete(`http://localhost:8080/vsm/${vsmId}/customer-output/customer/${customerId}`);
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to delete customer:", err);
        }
    }


    return (
        <div className="work-panel">
            <h2 className="work-panel-title">{t("work-panel.title")}</h2>

            <div className="work-panel-section">
                <h3>{t("work-panel.process-tables-label")}</h3>
                {processTables.length === 0 ? (
                    <p>No process tables available.</p>
                ) : (
                    processTables.map(table => (
                        <div
                            className="work-panel-option"
                            key={table.id}
                        >
                            <label>
                                {table.position}. {table.title}
                            </label>

                            <button
                                type="button"
                                onClick={() => handleTableClick(table.id)}
                            >
                                {t("work-panel.modify-label")}
                            </button>
                            <button className='button-del' onClick={() => handleDeleteTableClick(table.id)}>
                                ×
                            </button>
                        </div>
                    ))
                )}
                <button onClick={() => navigate("/process-table/new", {
                    state: {
                        position: processTablesCount + 1,
                        unitId: unitId,
                        vsmId: vsmId
                    }
                })} className="work-panel-button">
                    {t('common.add-new')}
                </button>
                <button onClick={() => navigate("/process-table/positioning", {
                    state: {
                        vsmId: vsmId,
                        tables: processTables
                    }
                })} className="work-panel-button">
                    {t('work-panel.positioning-btn')}
                </button>
            </div>

            <div className="work-panel-section">
                <h3>{t("work-panel.supply-title")}</h3>
                {supply.suppliers.length === 0 ? (
                    <p>No suppliers available.</p>
                ) : (
                    supply.suppliers.map(supplier => (
                        <div
                            className="work-panel-option"
                            key={supplier.id}
                        >
                            <label>
                                {supplier.name}
                            </label>

                            <button
                                type="button"
                                onClick={() => handleSupplierClick(supplier.id)}
                            >
                                {t("work-panel.modify-label")}
                            </button>
                            <button className='button-del' onClick={() => handleDeleteSupplierClick(supplier.id)}>
                                ×
                            </button>
                        </div>
                    ))
                )}
                <button
                    onClick={() =>
                        navigate("/supplier/new", {
                            state: {
                                supply,
                                vsmId
                            }
                        })
                    }
                    className="work-panel-button"
                >
                    {t("common.add-new")}
                </button>
            </div>

            <div className="work-panel-section">
                <h3>{t("work-panel.customer-section")}</h3>
                {customerOutput.customers.length === 0 ? (
                    <p>No customers available.</p>
                ) : (
                    customerOutput.customers.map(customer => (
                        <div
                            className="work-panel-option"
                            key={customer.id}
                        >
                            <label>
                                {customer.name}
                            </label>

                            <button
                                type="button"
                                onClick={() => handleCustomerClick(customer.id)}
                            >
                                {t("work-panel.modify-label")}
                            </button>
                            <button className='button-del' onClick={() => handleDeleteCustomerClick(customer.id)}>
                                ×
                            </button>
                        </div>
                    ))
                )}
                 <button
                    onClick={() =>
                        navigate("/customer/new", {
                            state: {
                                customerOutput,
                                vsmId
                            }
                        })
                    }
                    className="work-panel-button"
                >
                    {t("common.add-new")}
                </button>
            </div>


        </div>
    );
}

export default WorkPanel;