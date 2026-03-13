import React, { useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { Download, ChevronLeft, Plus, Trash2 } from 'lucide-react';

registerAllModules();

function SpreadsheetEditor({ document, onSave, onBack }) {
  const hotTableComponent = useRef(null);
  const [data, setData] = React.useState(document.content || Array(10).fill(null).map(() => Array(10).fill('')));

  const handleChange = (changes, source) => {
    if (source === 'loadData') return;
    const updated = [...data];
    if (hotTableComponent.current) {
      const hot = hotTableComponent.current.hotInstance;
      setData([...hot.getData()]);
      onSave([...hot.getData()]);
    }
  };

  const handleExport = () => {
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${document.name}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const addRow = () => {
    const newData = [...data, Array(data[0]?.length || 10).fill('')];
    setData(newData);
    onSave(newData);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
    onSave(newData);
  };

  const deleteLastRow = () => {
    if (data.length > 1) {
      const newData = data.slice(0, -1);
      setData(newData);
      onSave(newData);
    }
  };

  const deleteLastColumn = () => {
    if (data[0]?.length > 1) {
      const newData = data.map(row => row.slice(0, -1));
      setData(newData);
      onSave(newData);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Download className="w-5 h-5" />
          Exporter CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 px-8 py-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter Ligne
        </button>

        <button
          onClick={addColumn}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter Colonne
        </button>

        <button
          onClick={deleteLastRow}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer Ligne
        </button>

        <button
          onClick={deleteLastColumn}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer Colonne
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-auto">
          <HotTable
            ref={hotTableComponent}
            data={data}
            rowHeaders={true}
            colHeaders={true}
            height="auto"
            licenseKey="non-commercial-and-evaluation"
            afterChange={handleChange}
            stretchH="all"
            columnSorting={false}
            dropdownMenu={false}
          />
        </div>
      </div>
    </div>
  );
}

export default SpreadsheetEditor;
