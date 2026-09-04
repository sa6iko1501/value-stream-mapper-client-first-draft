import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';

import './ProcessTableForm.css';

function VSMapsForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [unit, setUnit] = useState({});
    const [units, setUnits] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Axios.get("http://localhost:8080/unit")
                const unitsDto = response?.data;
                const fetchedUnits = Object.entries(unitsDto).at(0)[1];
                setUnits(units => Object.entries(unitsDto).at(0)[1])
                if (fetchedUnits.length > 0) {
                    setUnit(fetchedUnits[0].id);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, [])

    const validate = () => {
        const errors = [];

        if (!title.trim()) {
            errors.push(
                t(
                    'vs-maps-form.title-required',
                )
            );
        }

        return errors;
    };

    

    const allowedUnits = [
        "KG",
        "PIECE",
        "PALLET",
        "CART",
        "NUMBER"
    ]

    const getAllowedUnits = (units) => {
         if (!units) {
        return [];
        }
        return units.filter(unit =>
        allowedUnits.includes(unit.unit_type)
        );
    } 

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }
        

        const selectedUnit = units.find(
          u => u.id === unit
        );


        const vsmDto = {
            id: null,
            title: title,
            date: null,
            supply: null,
            process_tables: null,
            unit: selectedUnit,
            customer_output: null,
            shifts: 1,
            length_of_shifts: 8,
            breaktime: 30
        }

        

        var response = await Axios.post(
          "http://localhost:8080/vsm",
          vsmDto
        );

        if(response.status === 201){
            navigate(`/vs-map/${response.data?.value_stream_map.id}`);
        }
    };

    const handleUnitChange = (unitId) => {
        setUnit(unitId);
    }

    const availableUnits = getAllowedUnits(units);

    if (units === undefined) {
        return (
            <div className="value-stream-maps">
                <div className="vs-maps-container">
                    <h1 className="vs-maps-title">{t("common.loading") || "Loading..."}</h1>
                </div>
            </div>
        );
    }
    else {
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
                        <h2>
                            {t(
                                "vs-map-form.create-new"
                            )}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                    <h3>
                        {t(
                            "vs-map-form.basic-info"
                        )}
                    </h3>

                    <div className="form-group">
                        <label>
                            {t(
                                "common.name"
                            )}:
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            placeholder={t(
                                'vs-map-form.enter-title'
                            )}
                        />
                    </div>

                    <h3>
                        {t(
                            "vs-map-form.unit"
                        )}
                    </h3>

                    <div className="form-group">
                        <label>
                            {t(
                                'vs-map-form.available-units',
                            )}:
                        </label>

                        <select value={unit} onChange={(e) => handleUnitChange(e.target.value)} className="form-input" >
                            <option value="" disabled> {t('vs-maps-form.select-unit', 'Select unit')} </option>
                            {availableUnits.map((unitObject) => (
                                <option key={unitObject.id} value={unitObject.id} > {unitObject.name} </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="save-btn"
                        >
                            {t(
                                'common.save',
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="cancel-btn"
                        >
                            {t(
                                'common.cancel',
                                'Cancel'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        );
    }


}

export default VSMapsForm;

