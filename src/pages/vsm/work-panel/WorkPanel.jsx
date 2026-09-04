import './WorkPanel.css'
import { useNavigate } from 'react-router'
import { useTranslation } from "react-i18next";
import { useState } from 'react'
import Axios from 'axios';

function WorkPanel({ processTables, unitId, vsmId, supply, customerOutput, shifts, shiftLength, breakTime, supplyInventory }) {
    const navigate = useNavigate();
    const [currentShifts, setcurrentShifts] = useState(shifts);
    const [currentLengthOfShifts, setcurrentShiftLength] = useState(shiftLength);
    const [currentBreakTime, setcurrentBreakTime] = useState(breakTime);
    const [currentSupplyInventory, setcurrentSupplyInventory] = useState(supplyInventory);
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

    const validateSettings = (settings) => {
        // Convert string inputs to numbers
        const shiftsNum = Number(settings.shifts);
        const lengthNum = Number(settings.length_of_shifts);
        const breaktimeNum = Number(settings.breaktime);

        // Validate shifts: positive whole number, 1-3
        if (isNaN(shiftsNum) || shiftsNum <= 0 || shiftsNum > 3 || !Number.isInteger(shiftsNum)) {
            return 'Shifts must be a positive whole number between 1 and 3';
        }

        // Validate length_of_shifts: positive number, 1-12 hours
        if (isNaN(lengthNum) || lengthNum <= 0 || lengthNum > 12) {
            return 'Shift length must be a positive number between 1 and 12 hours';
        }

        // Validate breaktime: positive whole number, 1-720 minutes
        if (isNaN(breaktimeNum) || breaktimeNum < 0 || !Number.isInteger(breaktimeNum) || breaktimeNum > 720) {
            return 'Breaktime must be a positive whole number between 0 and 720 minutes';
        }

        return null;
    };

    const handleSaveSettingsClick = async (vsmId) => {
        try {
            const settingsDto = {
                shifts: Number(currentShifts),
                length_of_shifts: Number(currentLengthOfShifts),
                breaktime: Number(currentBreakTime)
            };

            const validationError = validateSettings(settingsDto);
            if (validationError) {
                alert(validationError);
                return;
            }

            await Axios.put(`http://localhost:8080/vsm/${vsmId}/settings`, settingsDto);
            window.location.reload();
        } catch (err) {
            console.error('Error saving settings:', err);
        }
    };

    const validateSupplyInventory = (supplyInventory) => {
        if (isNaN(supplyInventory) || supplyInventory <= 0 || !Number.isInteger(supplyInventory)) {
            return 'Supply Inventory must be a positive whole number.';
        }
    }

    const handleSaveSupplyInventory = async (vsmId) => {
        try{
            const supplyDTO = {
                supply_inventory: Number(currentSupplyInventory)
            };

            const validationError = validateSupplyInventory(supplyDTO.supply_inventory);
             if (validationError) {
                alert(validationError);
                return;
            }

            await Axios.put(`http://localhost:8080/vsm/${vsmId}/supply/inventory`,
                supplyDTO
            )
            window.location.reload();
        }
        catch (err){
            console.error('Error saving supply inventory', err);
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

                <div className="form-group">
                    <label>Supply Inventory :</label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={currentSupplyInventory}
                        onChange={(e) => setcurrentSupplyInventory(e.target.value)}
                        className="form-input"
                    />
                </div>
                <button
                    onClick={() => handleSaveSupplyInventory(vsmId)}
                    className="work-panel-button"
                >
                    {t("common.save")}
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

            <div className="work-panel-section">
                <h3>{t("work-panel.vsm-settings")}</h3>

                <div className="form-group">
                    <label>Shifts:</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={currentShifts}
                        onChange={(e) => setcurrentShifts(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Length of Shifts (hours):</label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={currentLengthOfShifts}
                        onChange={(e) => setcurrentShiftLength(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Break Time per Shift (minutes):</label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={currentBreakTime}
                        onChange={(e) => setcurrentBreakTime(e.target.value)}
                        className="form-input"
                    />
                </div>

                <button
                    onClick={() => handleSaveSettingsClick(vsmId)}
                    className="work-panel-button"
                >
                    {t("common.save")}
                </button>
            </div>


        </div>
    );
}

export default WorkPanel;