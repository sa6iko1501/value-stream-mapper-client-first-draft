import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';
import './ProcessTablePositioningForm.css';

function ProcessTablePositioningForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const vsmId = location.state?.vsmId;
  const receivedTables = location.state?.tables || [];

  const [tables, setTables] = useState(
    [...receivedTables].sort((a, b) => a.position - b.position)
  );

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };


  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    const updatedTables = [...tables];

    // Remove the dragged item
    const [draggedTable] = updatedTables.splice(draggedIndex, 1);

    // Insert it at the new position
    updatedTables.splice(targetIndex, 0, draggedTable);

    setTables(updatedTables);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create updated objects with their new positions
    const updatedTables = tables.map((table, index) => ({
      ...table,
      position: index + 1
    }));

    try {
      console.log(updatedTables);
      setIsSubmitting(true);

      await Axios.put(
        `http://localhost:8080/vsm/${vsmId}/positioning`,
        updatedTables
      );

      navigate(-1);
    } catch (err) {
      console.error('Failed to update table positions:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vsmId) {
    return (
      <div className="process-table-form">
        No value stream map data provided.
      </div>
    );
  }


  return (
    <div className="process-table-form">
      <div className="positioning-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          ←
        </button>

        <div className="process-table-form-title">
          <h2>
            {t('positioning.title')}
          </h2>
        </div>
      </div>

      <p className="positioning-description">
        {t('process-table-positioning.description') ||
          'Drag and drop the tables to change their order.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="positioning-list">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`positioning-item ${draggedIndex === index ? 'dragging' : ''
                }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle">
                ☰
              </div>

              <div className="position-number">
                {index + 1}
              </div>

              <div className="positioning-item-content">
                <span className="positioning-item-title">
                  {table.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : t('common.save')}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProcessTablePositioningForm;