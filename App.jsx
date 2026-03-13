import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TextEditor from './components/TextEditor';
import SpreadsheetEditor from './components/SpreadsheetEditor';
import SlidesEditor from './components/SlidesEditor';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, text, sheet, slides

  // Charger documents depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('docflow_documents');
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder documents
  const saveDocuments = (docs) => {
    localStorage.setItem('docflow_documents', JSON.stringify(docs));
    setDocuments(docs);
  };

  // Créer nouveau document
  const createDocument = (type) => {
    const newDoc = {
      id: Date.now(),
      name: `Nouveau ${type === 'text' ? 'Document' : type === 'sheet' ? 'Tableur' : 'Présentation'}`,
      type: type,
      content: type === 'text' ? '' : type === 'sheet' ? createEmptySheet() : [{ title: 'Slide 1', content: '' }],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    
    const updatedDocs = [...documents, newDoc];
    saveDocuments(updatedDocs);
    openDocument(newDoc);
  };

  // Ouvrir document
  const openDocument = (doc) => {
    setCurrentDoc(doc);
    setView(doc.type);
  };

  // Retour au dashboard
  const goToDashboard = () => {
    if (currentDoc) {
      const updatedDocs = documents.map(doc =>
        doc.id === currentDoc.id ? { ...currentDoc, modifiedAt: new Date().toISOString() } : doc
      );
      saveDocuments(updatedDocs);
    }
    setCurrentDoc(null);
    setView('dashboard');
  };

  // Supprimer document
  const deleteDocument = (id) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocs);
    if (currentDoc?.id === id) {
      goToDashboard();
    }
  };

  // Dupliquer document
  const duplicateDocument = (id) => {
    const docToDuplicate = documents.find(doc => doc.id === id);
    if (docToDuplicate) {
      const newDoc = {
        ...docToDuplicate,
        id: Date.now(),
        name: `${docToDuplicate.name} (copie)`,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
      const updatedDocs = [...documents, newDoc];
      saveDocuments(updatedDocs);
    }
  };

  // Créer grille vide
  const createEmptySheet = () => {
    return Array(10).fill(null).map(() => Array(10).fill(''));
  };

  // Sauvegarder contenu document
  const saveDocumentContent = (content) => {
    const updated = { ...currentDoc, content, modifiedAt: new Date().toISOString() };
    setCurrentDoc(updated);
    const updatedDocs = documents.map(doc => doc.id === updated.id ? updated : doc);
    saveDocuments(updatedDocs);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        onCreateDocument={createDocument}
        onShowDashboard={() => goToDashboard()}
      />
      
      <main className="flex-1 overflow-auto">
        {view === 'dashboard' ? (
          <Dashboard
            documents={documents}
            onOpenDocument={openDocument}
            onDeleteDocument={deleteDocument}
            onDuplicateDocument={duplicateDocument}
            onCreateDocument={createDocument}
          />
        ) : view === 'text' && currentDoc ? (
          <TextEditor
            document={currentDoc}
            onSave={saveDocumentContent}
            onBack={goToDashboard}
          />
        ) : view === 'sheet' && currentDoc ? (
          <SpreadsheetEditor
            document={currentDoc}
            onSave={saveDocumentContent}
            onBack={goToDashboard}
          />
        ) : view === 'slides' && currentDoc ? (
          <SlidesEditor
            document={currentDoc}
            onSave={saveDocumentContent}
            onBack={goToDashboard}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
