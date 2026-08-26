import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from 'uuid';
import './ProcessTableForm.css';
import Axios from 'axios';

function ProcessTableForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const table = location.state?.table;
  const { t } = useTranslation();
  const { id } = useParams();

  const [title, setTitle] = useState(table?.title || '');
  const [rows, setRows] = useState(table?.rows || []);
  const [units, setUnits] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get("http://localhost:8080/unit");
        const unitsDto = response?.data;
        setUnits(units => Object.entries(unitsDto).at(0)[1]);
      }
      catch (err) {
        console.error(err);
      }

    }
    fetchData();
  }, []);


  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleRowChange = (index, field, value) => {
    setRows(previousRows => {
      const newRows = [...previousRows];

      if (field === 'unit') {
        const selectedUnit = units.find(
          unit => unit.id === value
        );

        newRows[index] = {
          ...newRows[index],
          unit: selectedUnit || null
        };
      } else {
        newRows[index] = {
          ...newRows[index],
          [field]: value
        };
      }

      return newRows;
    });
  };

  const addRow = () => {
    setRows([...rows, { id: null, row_name: '', value: 0, unit: '' }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const validateRows = () => {
    const errors = [];
    const usedRowTypes = new Set();

    rows.forEach((row, index) => {
      const rowNumber = index + 1;

      // Required row type
      if (!row.row_type) {
        errors.push(`Row ${rowNumber}: Row type is required.`);
      }

      // Required value
      if (
        row.value === '' ||
        row.value === null ||
        row.value === undefined
      ) {
        errors.push(`Row ${rowNumber}: Value is required.`);
      }

      // Required unit
      if (!row.unit) {
        errors.push(`Row ${rowNumber}: Unit is required.`);
      }

      // Duplicate row types
      if (row.row_type) {
        if (usedRowTypes.has(row.row_type)) {
          errors.push(
            `Row ${rowNumber}: ${getRowName(row.row_type)} already exists.`
          );
        } else {
          usedRowTypes.add(row.row_type);
        }
      }

      // Stop here if value is empty
      if (
        row.value === '' ||
        row.value === null ||
        row.value === undefined
      ) {
        return;
      }

      const numericValue = Number(
        String(row.value).trim().replace(',', '.')
      );

      if (!Number.isFinite(numericValue)) {
        errors.push(`Row ${rowNumber}: Value must be a valid number.`);
        return;
      }

      // No negative values
      if (numericValue < 0) {
        errors.push(`Row ${rowNumber}: Value cannot be negative.`);
      }

      // Get the unit type from the unit object
      const unitType = row.unit?.unit_type;

      // Percent validation
      if (
        unitType === "PERCENT" &&
        (numericValue < 0 || numericValue > 100)
      ) {
        errors.push(
          `Row ${rowNumber}: Percent must be between 0 and 100.`
        );
      }

      // Number validation
      if (
        unitType === "NUMBER" &&
        !Number.isInteger(numericValue)
      ) {
        errors.push(
          `Row ${rowNumber}: Number must be a whole number.`
        );
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRows();

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    const processTableDto = {
      ...table,
      title,
      rows
    };

    console.log(processTableDto);

    try {
      await Axios.post(
        "http://localhost:8080/table",
        processTableDto
      );

      navigate(-1);
    } catch (err) {
      console.error("Failed to save table:", err);
    }
  };

  console.log(rows);
  const handleRowTypeChange = (index, rowType) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      row_type: rowType,
      row_name: getRowName(rowType),
      unit: '',
    };

    setRows(newRows);
  };

  const getRowName = (rowType) => {
    switch (rowType) {
      case "PROCESS_TIME": {
        return "Process Time";
      }
      case "CYCLE_TIME": {
        return "Cycle Time";
      }
      case "UPTIME": {
        return "Uptime";
      }
      case "CO": {
        return "Changeover Time";
      }
      case "SHIFTS": {
        return "Shifts";
      }
      case "WORKERS": {
        return "Workers";
      }
      case "QUALITY": {
        return "Quality";
      }
      default: {
        return "Row Name";
      }
    }
  }

  const getUnitsForRowType = (rowType) => {
    const allowed = allowedUnits[rowType] || [];
    return units.filter(unit =>
      allowed.includes(unit.name)
    );
  };

  const rowTypes = [
    "QUALITY",
    "WORKERS",
    "SHIFTS",
    "PROCESS_TIME",
    "CYCLE_TIME",
    "UPTIME",
    "CO",
  ]

  const allowedUnits = {
    QUALITY: ["Percent"],
    WORKERS: ["Number"],
    SHIFTS: ["Number"],
    SHIFT_LENGTH: ["Hour"],
    TOTAL_AVAILABLE_TIME: ["Second", "Hour"],
    PROCESS_TIME: ["Second"],
    UPTIME: ["Percent"],
    CYCLE_TIME: ["Second", "Hour"],
    CO: ["Second", "Hour"]

  };

  if (!table) {
    return <div className="process-table-form">No table data provided.</div>;
  }

  if (units === undefined) {
    return (
      <div className="process-table-form">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <button type="button" onClick={() => navigate(-1)} className="back-btn">
            ←
          </button>
          <div className='process-table-form-title'>
            <h2>{t("common.loading") || "Loading..."}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="process-table-form">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <button type="button" onClick={() => navigate(-1)} className="back-btn">
          ←
        </button>
        <div className='process-table-form-title'>
          <h2>{t("edit-process-table.title") || "Edit process table"}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="form-input"
            placeholder="Enter table title"
          />
        </div>

        <h3>Rows</h3>
        {rows.map((row, index) => (
          <div key={index} className="row-edit">
            <select
              value={row.row_type || ""}
              onChange={(e) =>
                handleRowTypeChange(index, e.target.value)
              }
              className="form-input"
            >
              <option value="" disabled>
                Select row type
              </option>

              {rowTypes.map((rowType) => (
                <option key={rowType} value={rowType}>
                  {getRowName(rowType)}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={row.value ?? ''}
              onChange={(e) =>
                handleRowChange(index, 'value', e.target.value)
              }
              min="0"
              step={row.unit === "Number" ? "1" : "any"}
              placeholder="Value"
              className="form-input"
            />
            <select
              value={row.unit?.id || ""}
              onChange={(e) =>
                handleRowChange(index, 'unit', e.target.value)
              }
              className="form-input"
            >
              <option value="" disabled>
                Select unit
              </option>

              {getUnitsForRowType(row.row_type).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="remove-btn"
            >
              ×
            </button>
          </div>
        ))}

        <button type="button" onClick={addRow} className="add-btn">
          {t("edit-process-table.add-row") || "Add row"}
        </button>

        <div className="form-actions">
          <button type="submit" className="save-btn">{t("edit-process-table.save")}</button>
          <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
            {t("edit-process-table.cancel") || "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProcessTableForm;