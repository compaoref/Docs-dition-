import React, { useState } from 'react';
import { Trash2, Copy, FileText, Grid3x3, Presentation, Upload } from 'lucide-react';

function Dashboard({ documents, onOpenDocument, onDeleteDocument, onDuplicateDocument, onCreateDocument }) {
  const [showImportModal, setShowImportModal] = useState(false);

  const getDocIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'sheet': return '📊';
      case 'slides': return '🎞️';
      default: return '📄';
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newDoc = {
        id: Date.now(),
        name: file.name.split('.')[0] || 'Document importé',
        type: 'text',
        content: event.target.result,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
      
      const saved = localStorage.getItem('docflow_documents');
      const docs = saved ? JSON.parse(saved) : [];
      docs.push(newDoc);
      localStorage.setItem('docflow_documents', JSON.stringify(docs));
      window.location.reload();
    };

    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      alert('Format non supporté. Utilisez TXT, CSV ou MD');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Mes <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Documents</span>
        </h1>
        <p className="text-gray-600">Gérez et éditez vos documents facilement</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={() => onCreateDocument('text')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Nouveau Texte
        </button>
        
        <button
          onClick={() => onCreateDocument('sheet')}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center gap-2"
        >
          <Grid3x3 className="w-5 h-5" />
          Nouveau Tableur
        </button>

        <button
          onClick={() => onCreateDocument('slides')}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center gap-2"
        >
          <Presentation className="w-5 h-5" />
          Nouvelles Slides
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Importer
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun document</h3>
          <p className="text-gray-500 mb-6">Créez votre premier document pour commencer</p>
          <button
            onClick={() => onCreateDocument('text')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Créer un document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="text-4xl mb-3">{getDocIcon(doc.type)}</div>
                <h3 className="font-bold text-gray-900 mb-1 truncate">{doc.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(doc.modifiedAt).toLocaleDateString('fr-FR')}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenDocument(doc)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition font-semibold"
                  >
                    Ouvrir
                  </button>
                  <button
                    onClick={() => onDuplicateDocument(doc.id)}
                    className="px-3 py-2 bg-gray-200 text-gray-900 rounded text-sm hover:bg-gray-300 transition"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer ce document?')) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Importer un Fichier</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Sélectionnez un fichier (TXT, CSV, MD)
              </label>
              <input
                type="file"
                onChange={handleImport}
                accept=".txt,.csv,.md"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
