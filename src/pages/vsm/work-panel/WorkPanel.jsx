import './WorkPanel.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router'
import { useTranslation } from "react-i18next";
import Axios from 'axios';

function WorkPanel({ processTables, unitId, vsmId, supply }) {
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
            await Axios.delete(`http://localhost:8080/table/${tableId}`);

            window.location.reload();
        } catch (err) {
            console.error("Failed to delete table:", err);
        }
    };

    const handleSupplierClick = (supplierId) => {
        const supplier = supply.suppliers.find(
            supplier => supplier.id === supplierId
        );

        if (!supplier) {
            console.error("Supplier not found:", supplierId);
            return;
        }

        navigate(`/supplier/${supplierId}/edit`, {
            state: {
                supplier,
                supply,
                vsmId
            }
        });
    };

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
                    {t('work-panel.add-new')}
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
                            <button className='button-del' onClick={() => handleDeleteTableClick(supplier.id)}>
                                ×
                            </button>
                        </div>
                    ))
                )}
                <button onClick={() => navigate("/process-table/positioning", {
                    state: {
                        vsmId: vsmId,
                        supply: supply
                    }
                })} className="work-panel-button">
                    {t('common.configure')}
                </button>
            </div>

            <div className="work-panel-section">
                <h3>Client</h3>
                <div className="work-panel-option">
                    <input type="checkbox" id="client1" />
                    <label htmlFor="client1">Client A</label>/supply
                </div>
                <div className="work-panel-option">
                    <input type="checkbox" id="client2" />
                    <label htmlFor="client2">Client B</label>
                </div>
                <button className="work-panel-button">Add Node</button>
            </div>


        </div>
    );
}

export default WorkPanel;