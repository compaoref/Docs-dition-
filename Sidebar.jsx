import React from 'react';
import { FileText, Grid3x3, Presentation, Plus, Home, Settings, HardDrive } from 'lucide-react';

function Sidebar({ onCreateDocument, onShowDashboard }) {
  const [storageUsed, setStorageUsed] = React.useState(0);

  React.useEffect(() => {
    const data = localStorage.getItem('docflow_documents');
    if (data) {
      const size = new Blob([data]).size;
      setStorageUsed((size / 1024 / 1024).toFixed(2));
    }
  }, []);

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">DocFlow</h1>
            <p className="text-xs text-gray-400">Éditeur Universel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <button
          onClick={onShowDashboard}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition text-left"
        >
          <Home className="w-5 h-5" />
          <span>Mes Documents</span>
        </button>
      </nav>

      {/* Créer Documents */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <p className="text-xs text-gray-400 uppercase font-semibold px-4 mb-3">Créer</p>
        
        <button
          onClick={() => onCreateDocument('text')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition text-left text-sm"
        >
          <FileText className="w-5 h-5" />
          <span>📝 Nouveau Texte</span>
        </button>

        <button
          onClick={() => onCreateDocument('sheet')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition text-left text-sm"
        >
          <Grid3x3 className="w-5 h-5" />
          <span>📊 Nouveau Tableur</span>
        </button>

        <button
          onClick={() => onCreateDocument('slides')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition text-left text-sm"
        >
          <Presentation className="w-5 h-5" />
          <span>🎞️ Nouvelles Slides</span>
        </button>
      </div>

      {/* Stockage */}
      <div className="p-4 border-t border-gray-700 mt-auto space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="w-4 h-4 text-orange-400" />
          <span className="text-gray-300">{storageUsed} MB utilisés</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-orange-400 h-2 rounded-full"
            style={{ width: `${Math.min((storageUsed / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
