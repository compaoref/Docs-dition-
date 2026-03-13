import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Download, Play } from 'lucide-react';

function SlidesEditor({ document, onSave, onBack }) {
  const [slides, setSlides] = useState(document.content || [{ title: 'Slide 1', content: '' }]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const updateSlide = (title, content) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { title, content };
    setSlides(newSlides);
    onSave(newSlides);
  };

  const addSlide = () => {
    const newSlides = [...slides, { title: `Slide ${slides.length + 1}`, content: '' }];
    setSlides(newSlides);
    setCurrentSlide(newSlides.length - 1);
    onSave(newSlides);
  };

  const deleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, idx) => idx !== currentSlide);
      setSlides(newSlides);
      setCurrentSlide(Math.max(0, currentSlide - 1));
      onSave(newSlides);
    }
  };

  const handleExport = () => {
    const text = slides
      .map((slide, idx) => `--- SLIDE ${idx + 1} ---\n${slide.title}\n${slide.content}`)
      .join('\n\n');
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `${document.name}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 px-8 py-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter Slide
        </button>

        {slides.length > 1 && (
          <button
            onClick={deleteSlide}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}

        <span className="px-4 py-2 text-sm font-semibold text-gray-700">
          Slide {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-48 bg-gray-100 border-r border-gray-200 overflow-y-auto p-4 space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                currentSlide === idx
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="text-xs font-semibold text-gray-700">Slide {idx + 1}</div>
              <div className="text-xs text-gray-500 mt-2 truncate">{slide.title}</div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                value={slides[currentSlide].title}
                onChange={(e) => updateSlide(e.target.value, slides[currentSlide].content)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg font-bold"
                placeholder="Titre de la slide"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu</label>
              <textarea
                value={slides[currentSlide].content}
                onChange={(e) => updateSlide(slides[currentSlide].title, e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-sans text-base resize-none"
                placeholder="Contenu de la slide"
              />
            </div>

            {/* Preview */}
            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Aperçu</h3>
              <div className="bg-white border-2 border-gray-300 rounded-lg p-8 min-h-80 aspect-video flex flex-col justify-between">
                <h1 className="text-4xl font-bold text-gray-900">{slides[currentSlide].title}</h1>
                <p className="text-lg text-gray-700 whitespace-pre-wrap">{slides[currentSlide].content}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlidesEditor;
