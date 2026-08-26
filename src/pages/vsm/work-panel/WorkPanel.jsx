import './WorkPanel.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router'
import { useTranslation } from "react-i18next";

function WorkPanel({ processTables }) {
    const navigate = useNavigate();
    const { t } = useTranslation()
    const [tables, setTables] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(null);


    if (Object.entries(processTables).length === 0) {
        return (
            <div className='work-panel'>
                <h3>{t("common.loading") || "Loading..."}</h3>
            </div>
        );
    }


    const handleTableClick = (tableId) => {
        const table = Object.values(processTables).find(t => t.id === tableId);
        navigate(`/edit-process-table/${tableId}`, { state: { table } });
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
                                {table.title}
                            </label>

                            <button
                                type="button"
                                onClick={() => handleTableClick(table.id)}
                            >
                                {t("work-panel.modify-label")}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="work-panel-section">
                <h3>Client</h3>
                <div className="work-panel-option">
                    <input type="checkbox" id="client1" />
                    <label htmlFor="client1">Client A</label>
                </div>
                <div className="work-panel-option">
                    <input type="checkbox" id="client2" />
                    <label htmlFor="client2">Client B</label>
                </div>
                <button className="work-panel-button">Add Node</button>
            </div>

            <div className="work-panel-section">
                <h3>Inventory</h3>
                <div className="work-panel-option">
                    <input type="checkbox" id="inv1" />
                    <label htmlFor="inv1">Inventory 1</label>
                </div>
                <div className="work-panel-option">
                    <input type="checkbox" id="inv2" />
                    <label htmlFor="inv2">Inventory 2</label>
                </div>
                <button className="work-panel-button">Add Node</button>
                <button className="work-panel-button">Add Edge</button>
            </div>
        </div>
    );
}

export default WorkPanel;