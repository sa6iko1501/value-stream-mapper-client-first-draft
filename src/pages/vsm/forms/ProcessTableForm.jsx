import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import './ProcessTableForm.css';
import Axios from 'axios';

function ProcessTableForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingTable = location.state?.table;
  const position = location.state?.position;
  const vsmId = location.state?.vsmId;
  const unitId = location.state?.unitId;
  const isEditMode = !!existingTable;
  const { t } = useTranslation();
  const { id } = useParams();
  const [units, setUnits] = useState();
  const [title, setTitle] = useState(
    existingTable?.title || ''
  );

  const [rows, setRows] = useState(
    existingTable?.rows || []
  );

  const [inventoryAmount, setInventoryAmount] = useState(
    existingTable?.inventory?.amount ?? ''
  );

  const inventoryUnit = units
    ? Object.entries(units)
      .flatMap(([, value]) => Array.isArray(value) ? value : [value])
      .find(unit => unit.id === unitId)
    : undefined;


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

      if (!row.row_type) {
        errors.push(`Row ${rowNumber}: Row type is required.`);
      }

      if (
        row.value === '' ||
        row.value === null ||
        row.value === undefined
      ) {
        errors.push(`Row ${rowNumber}: Value is required.`);
      }

      if (!row.unit) {
        errors.push(`Row ${rowNumber}: Unit is required.`);
      }

      if (row.row_type) {
        if (usedRowTypes.has(row.row_type)) {
          errors.push(
            `Row ${rowNumber}: ${getRowName(row.row_type)} already exists.`
          );
        } else {
          usedRowTypes.add(row.row_type);
        }
      }

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

      if (numericValue < 0) {
        errors.push(`Row ${rowNumber}: Value cannot be negative.`);
      }

      const unitType = row.unit?.unit_type;

      if (
        unitType === "PERCENT" &&
        (numericValue < 0 || numericValue > 100)
      ) {
        errors.push(
          `Row ${rowNumber}: Percent must be between 0 and 100.`
        );
      }

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

  const validateInventory = () => {
    const errors = [];

    if (
      inventoryAmount === '' ||
      inventoryAmount === null ||
      inventoryAmount === undefined
    ) {
      errors.push('Inventory amount is required.');
      return errors;
    }

    const numericAmount = Number(
      String(inventoryAmount).trim().replace(',', '.')
    );

    if (!Number.isFinite(numericAmount)) {
      errors.push('Inventory amount must be a valid number.');
      return errors;
    }

    if (numericAmount < 0) {
      errors.push('Inventory amount cannot be negative.');
    }

    return errors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = [
      ...validateRows(),
      ...validateInventory()
    ];

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    const updatedInventory = {
      ...(existingTable?.inventory || { id: null, unit: inventoryUnit.name, nextInLine: null }),
      amount: Number(
        String(inventoryAmount).trim().replace(',', '.')
      )
    };

    const processTableDto = isEditMode
      ? {
        ...existingTable,
        title,
        rows,
        inventory: updatedInventory
      }
      : {
        title,
        rows,
        inventory: updatedInventory,
        position: position,
        vsm_id: vsmId
      };

    try {

      if (isEditMode) {
        await Axios.put(
          "http://localhost:8080/table",
          processTableDto
        );
      } else {
        await Axios.post(
          "http://localhost:8080/table",
          processTableDto
        );
      }

      navigate(-1);

    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? 'update' : 'create'} table:`,
        err
      );
    }
  };

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
          <h2>{isEditMode ? t("edit-process-table.title") : t("edit-process-table.title-create")}</h2>
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
          {`+ ${t("edit-process-table.add-row")}` || "Add row"}
        </button>

        <h3>Inventory</h3>

        <div className="inventory-edit">
          <div className="form-group">
            <label>Amount:</label>

            <input
              type="number"
              value={inventoryAmount}
              onChange={(e) => setInventoryAmount(e.target.value)}
              min="0"
              step="any"
              placeholder="Inventory amount"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Unit:</label>

            <input
              type="text"
              value={isEditMode ? existingTable?.inventory?.unit : inventoryUnit.name}
              disabled
              className="form-input"
            />
          </div>
        </div>

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