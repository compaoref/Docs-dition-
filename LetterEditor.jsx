import { useState, useRef, useEffect } from "react";
import * as mammoth from "mammoth";

const TEMPLATES = {
  vide: {
    label: "✏️ Lettre vierge",
    content: `[Votre Prénom et Nom]
[Adresse]
[Téléphone]
[Email]

Ouagadougou, le [Date]

À [Destinataire]
[Structure]
[Ville]

Objet : [Objet de la lettre]

Madame, Monsieur,

[Corps de votre lettre...]

Dans l'attente d'une suite favorable, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
  },
  motivation: {
    label: "📄 Lettre de motivation",
    content: `[Votre Prénom et Nom]
Ouagadougou, Burkina Faso
[Téléphone]
[Email]

Ouagadougou, le [Date]

À la Direction des Ressources Humaines
[Nom de la Structure]
Ouagadougou, Burkina Faso

Objet : Candidature au poste de [Intitulé du poste]

Madame, Monsieur,

[Accroche : présentez votre vision du poste en 1-2 phrases percutantes.]

Titulaire d'un Baccalauréat G2 en Comptabilité et d'une Licence Professionnelle en Banque et Microfinance, je combine rigueur comptable, maîtrise des opérations bancaires et capacité à créer des outils concrets. J'ai notamment conçu un outil automatisé de rapprochement bancaire sous Excel-VBA qui a réduit le temps de traitement de trois heures à quinze minutes.

[Développez vos compétences spécifiques au poste...]

[Expliquez votre motivation pour cette structure...]

Je suis immédiatement disponible et pleinement motivé à contribuer activement à la performance de votre structure.

Persuadé que mon profil correspond à vos attentes, je reste disponible pour tout entretien à votre convenance. Vous voudrez bien trouver ci-joint mon curriculum vitae.

Dans l'attente d'une suite favorable, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
  },
  demande: {
    label: "📋 Demande formelle",
    content: `[Votre Prénom et Nom]
Ouagadougou, Burkina Faso
[Téléphone]
[Email]

Ouagadougou, le [Date]

À Monsieur/Madame [Titre et Nom]
[Structure]
Ouagadougou, Burkina Faso

Objet : Demande de [objet]

Monsieur/Madame,

J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance solliciter [objet de la demande].

[Développez le contexte et la justification de votre demande...]

[Expliquez ce que vous attendez comme réponse ou action...]

Dans l'espoir que ma demande retiendra votre attention, je reste à votre disposition pour tout renseignement complémentaire.

Dans l'attente d'une suite favorable, veuillez agréer, Monsieur/Madame, l'expression de ma profonde considération.`
  }
};

// Signature Pad Component
function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#1a3a8f";
    ctx.fill();
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a3a8f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave(null);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-blue-300 rounded-lg bg-white overflow-hidden" style={{touchAction:"none"}}>
        <canvas
          ref={canvasRef}
          width={600} height={150}
          style={{width:"100%", height:"120px", cursor:"crosshair", display:"block"}}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <p className="text-xs text-gray-400 text-center">Signez dans le cadre ci-dessus avec votre doigt ou la souris</p>
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
          🗑️ Effacer
        </button>
        <button onClick={save} disabled={!hasSignature}
          className={`flex-1 py-2 text-sm rounded-lg font-medium transition ${hasSignature ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          ✅ Appliquer
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("editor");
  const [letterText, setLetterText] = useState(TEMPLATES.motivation.content);
  const [signature, setSignature] = useState(null);
  const [signatureApplied, setSignatureApplied] = useState(false);
  const [importedFileName, setImportedFileName] = useState(null);
  const [toast, setToast] = useState(null);
  const [fontSize, setFontSize] = useState(13);
  const [showSigPad, setShowSigPad] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTemplate = (key) => {
    setLetterText(TEMPLATES[key].content);
    setImportedFileName(null);
    setSignatureApplied(false);
    setSignature(null);
    showToast("Modèle chargé ✓");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "docx") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setLetterText(result.value);
        setImportedFileName(file.name);
        showToast(`Fichier importé : ${file.name} ✓`);
      } catch {
        showToast("Erreur lors de l'import du fichier Word", "error");
      }
    } else if (ext === "txt") {
      const text = await file.text();
      setLetterText(text);
      setImportedFileName(file.name);
      showToast(`Fichier importé : ${file.name} ✓`);
    } else {
      showToast("Format accepté : .docx ou .txt", "error");
    }
    e.target.value = "";
  };

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    if (dataUrl) {
      setSignatureApplied(true);
      setShowSigPad(false);
      showToast("Signature appliquée ✓");
    } else {
      setSignatureApplied(false);
    }
  };

  const printToPDF = () => {
    window.print();
  };

  const lineCount = letterText.split("\n").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: fixed !important;
            left: 0; top: 0;
            width: 100% !important;
            background: white !important;
            padding: 40px 50px !important;
            font-family: Arial, sans-serif !important;
            font-size: 12pt !important;
            line-height: 1.6 !important;
            color: #000 !important;
          }
          #print-area pre {
            white-space: pre-wrap !important;
            font-family: Arial, sans-serif !important;
            font-size: 12pt !important;
            margin: 0 !important;
            color: #000 !important;
          }
          #sig-print {
            margin-top: 10px !important;
            display: block !important;
          }
        }
        @media screen {
          #print-area { display: none; }
        }
      `}</style>

      {/* Zone d'impression cachée */}
      <div id="print-area">
        <pre>{letterText}</pre>
        {signatureApplied && signature && (
          <img id="sig-print" src={signature} alt="signature" style={{height:"60px", marginTop:"8px"}} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-blue-800">📝 Éditeur de Lettres</h1>
            <p className="text-xs text-gray-400">Modifiez • Signez • Exportez en PDF</p>
          </div>
          <button
            onClick={printToPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition flex items-center gap-2"
          >
            📄 Exporter PDF
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* TABS */}
        <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden">
          {[["editor","✏️ Éditeur"],["templates","📋 Modèles"],["signature","🖊️ Signature"],["import","📂 Importer"]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-xs font-semibold transition ${tab===key ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ═══ ONGLET ÉDITEUR ═══ */}
        {tab === "editor" && (
          <div className="space-y-3">
            {importedFileName && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
                📎 <span className="font-medium">{importedFileName}</span>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border p-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Taille du texte :</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize(f => Math.max(10, f-1))}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center">−</button>
                <span className="text-sm font-bold text-blue-700 w-8 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(f => Math.min(18, f+1))}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center">+</button>
              </div>
              <span className="text-xs text-gray-400 ml-auto">{lineCount} lignes</span>
            </div>

            {/* Éditeur de texte */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gray-50 border-b px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-xs text-gray-400 ml-2">Votre lettre</span>
              </div>
              <textarea
                value={letterText}
                onChange={e => setLetterText(e.target.value)}
                className="w-full p-5 focus:outline-none resize-none font-mono text-gray-800 leading-relaxed"
                style={{ fontSize: `${fontSize}px`, minHeight: "520px" }}
                placeholder="Commencez à saisir votre lettre ici..."
                spellCheck={true}
              />
            </div>

            {/* Aperçu signature */}
            {signatureApplied && signature && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Signature appliquée :</p>
                <img src={signature} alt="signature" className="h-12 opacity-90" />
                <button onClick={() => { setSignatureApplied(false); showToast("Signature retirée"); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 underline">
                  Retirer la signature
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setSignatureApplied(false); setSignature(null); setLetterText(""); setImportedFileName(null); showToast("Lettre effacée"); }}
                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">
                🗑️ Effacer tout
              </button>
              <button onClick={printToPDF}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow transition">
                📄 Exporter en PDF
              </button>
            </div>
          </div>
        )}

        {/* ═══ ONGLET MODÈLES ═══ */}
        {tab === "templates" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 bg-white rounded-xl p-4 shadow-sm border">
              Choisissez un modèle pour démarrer. Vous pourrez ensuite le modifier dans l'onglet <strong>Éditeur</strong>.
            </p>
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{tpl.label}</h3>
                  <button onClick={() => { loadTemplate(key); setTab("editor"); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    Utiliser
                  </button>
                </div>
                <pre className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 overflow-hidden max-h-24 font-mono leading-relaxed" style={{whiteSpace:"pre-wrap"}}>
                  {tpl.content.substring(0, 200)}...
                </pre>
              </div>
            ))}

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-bold text-orange-700 mb-1">💡 Astuce</p>
              <p className="text-xs text-orange-600">Remplacez toutes les parties entre crochets <strong>[...]</strong> par vos vraies informations dans l'éditeur.</p>
            </div>
          </div>
        )}

        {/* ═══ ONGLET SIGNATURE ═══ */}
        {tab === "signature" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold text-gray-800 mb-1">🖊️ Dessinez votre signature</h3>
              <p className="text-xs text-gray-500 mb-4">Utilisez votre doigt (téléphone) ou la souris (ordinateur)</p>
              <SignaturePad onSave={handleSignatureSave} />
            </div>

            {signatureApplied && signature && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-bold text-green-700 mb-2">✅ Signature enregistrée</p>
                <img src={signature} alt="signature" className="h-14 border border-green-200 rounded-lg p-2 bg-white" />
                <p className="text-xs text-green-600 mt-2">Votre signature sera incluse dans l'export PDF.</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-bold text-blue-700 mb-1">💡 Comment ça marche</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Dessinez votre signature dans le cadre blanc</li>
                <li>• Cliquez sur <strong>Appliquer</strong></li>
                <li>• La signature apparaîtra dans votre PDF exporté</li>
                <li>• Elle sera en bleu — comme un Bic bleu</li>
              </ul>
            </div>
          </div>
        )}

        {/* ═══ ONGLET IMPORTER ═══ */}
        {tab === "import" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold text-gray-800 mb-1">📂 Importer un fichier</h3>
              <p className="text-xs text-gray-500 mb-4">Importez un fichier Word (.docx) ou texte (.txt) pour le modifier</p>

              <input ref={fileInputRef} type="file" accept=".docx,.txt" onChange={handleImport} className="hidden" />

              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition text-center">
                <div className="text-4xl mb-2">📎</div>
                <p className="text-sm font-bold text-blue-700">Appuyez pour choisir un fichier</p>
                <p className="text-xs text-blue-500 mt-1">Formats acceptés : .docx (Word) et .txt</p>
              </button>

              {importedFileName && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-sm text-green-700 font-medium">{importedFileName} importé avec succès</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
              <h3 className="font-bold text-gray-800">📋 Ce que vous pouvez faire</h3>
              {[
                ["📄 Importer Word (.docx)", "Importez vos lettres de motivation déjà créées et modifiez-les"],
                ["✏️ Modifier le texte", "Changez les informations, la date, le destinataire..."],
                ["🖊️ Ajouter une signature", "Dessinez votre signature et appliquez-la"],
                ["📄 Exporter en PDF", "Convertissez votre lettre en PDF prête à envoyer"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 items-start">
                  <span className="text-lg">{title.split(" ")[0]}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{title.substring(3)}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-bold text-yellow-700 mb-1">⚠️ Note importante</p>
              <p className="text-xs text-yellow-600">Les fichiers Excel (.xlsx) ne sont pas modifiables dans cet outil. Pour Excel, utilisez Google Sheets ou l'application Numbers sur votre téléphone.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
