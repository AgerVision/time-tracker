import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

const ImportExportData = ({ intervals, categories, setIntervals, setCategories }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const fileInputRef = useRef(null);

  const exportData = () => {
    const data = {
      intervals,
      categories
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Datele au fost exportate cu succes!');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.intervals && data.categories) {
            setImportedData(data);
            setIsImportModalOpen(true);
          } else {
            toast.error('Fișierul importat nu conține date valide.');
          }
        } catch (error) {
          toast.error('Eroare la importarea datelor. Asigurați-vă că fișierul este valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = (action) => {
    if (action === 'append') {
      setIntervals(prevIntervals => {
        const newIntervals = [...prevIntervals];
        importedData.intervals.forEach(importedInterval => {
          if (!newIntervals.some(interval => interval.id === importedInterval.id)) {
            newIntervals.push(importedInterval);
          }
        });
        return newIntervals;
      });
      setCategories(prevCategories => {
        const newCategories = [...prevCategories];
        importedData.categories.forEach(importedCat => {
          if (!newCategories.some(cat => cat.name === importedCat.name)) {
            newCategories.push(importedCat);
          }
        });
        return newCategories;
      });
    } else if (action === 'overwrite') {
      setIntervals(importedData.intervals);
      setCategories(importedData.categories);
    }
    closeImportModal();
    toast.success('Datele au fost importate cu succes!');
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={exportData}
        className="w-full px-4 py-2 bg-green-500 text-white rounded text-center cursor-pointer hover:bg-green-600 transition-colors duration-200"
      >
        Export date
      </button>
      <label className="w-full px-4 py-2 bg-yellow-500 text-white rounded text-center cursor-pointer hover:bg-yellow-600 transition-colors duration-200">
        Import date
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <Modal
        isOpen={isImportModalOpen}
        onRequestClose={closeImportModal}
        contentLabel="Import Options"
        className="modal"
        overlayClassName="overlay"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          content: {
            position: 'relative',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            margin: '0 auto',
          }
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Opțiuni de import</h2>
        <p className="mb-4">Cum doriți să importați datele?</p>
        <div className="flex justify-between">
          <button
            onClick={() => handleImport('append')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Adaugă la datele existente
          </button>
          <button
            onClick={() => handleImport('overwrite')}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Înlocuiește datele existente
          </button>
        </div>
        <button
          onClick={closeImportModal}
          className="mt-4 px-4 py-2 bg-gray-300 rounded w-full"
        >
          Anulează
        </button>
      </Modal>
    </div>
  );
};

export default ImportExportData;