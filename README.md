# 📄 DocFlow - Éditeur de Documents Universel

Application web React complète pour créer, éditer et exporter des documents.

## ✨ Fonctionnalités

- ✅ **Éditeur Texte** - TipTap (édition riche)
- ✅ **Éditeur Tableur** - Handsontable (grille complète)
- ✅ **Éditeur Slides** - Custom React (présentations)
- ✅ **Import/Export** - TXT, CSV, Markdown
- ✅ **localStorage** - Sauvegarde locale (10 MB)
- ✅ **Interface Moderne** - Tailwind CSS
- ✅ **Responsive** - Fonctionne partout

## 🚀 Installation Locale

### Prérequis
- Node.js 14+ installé
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/votrenom/docflow.git
cd docflow

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm start

# L'app s'ouvre sur http://localhost:3000
```

## 🌐 Déploiement sur GitHub Pages

### Étape 1: Configuration GitHub

```bash
# Dans votre repository, si ce n'est pas déjà fait
git remote add origin https://github.com/votrenom/docflow.git
```

### Étape 2: Configuration npm

Le `package.json` est déjà configuré avec:
```json
"homepage": "https://votrenom.github.io/docflow"
```

⚠️ **Remplacez `votrenom` par votre username GitHub**

### Étape 3: Installer gh-pages

```bash
npm install --save-dev gh-pages
```

(Déjà dans le package.json, juste `npm install`)

### Étape 4: Build et Deploy

```bash
# Créer la version production
npm run build

# Déployer sur GitHub Pages
npm run deploy

# Voilà! L'app est en ligne à:
# https://votrenom.github.io/docflow
```

## 📝 Utilisation

### Créer un Document
1. Cliquez sur "Nouveau Texte", "Nouveau Tableur" ou "Nouvelles Slides"
2. Commencez à éditer
3. Sauvegarde automatique en localStorage

### Éditer
- **Texte**: Utilisez la barre d'outils (gras, italique, titres, listes)
- **Tableur**: Double-cliquez pour éditer, Tab pour naviguer
- **Slides**: Éditez titre et contenu, aperçu en temps réel

### Exporter
- Cliquez "Exporter" pour télécharger le fichier
- Format dépend du type de document

### Importer
- Cliquez "Importer"
- Sélectionnez TXT, CSV, ou MD
- Document créé automatiquement

## 🛠️ Technologie

- **React 18** - UI framework
- **TipTap 2** - Éditeur texte riche
- **Handsontable** - Éditeur tableur
- **Tailwind CSS** - Styling
- **localStorage** - Stockage local

## 📁 Structure du Projet

```
docflow/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── TextEditor.jsx
│   │   ├── SpreadsheetEditor.jsx
│   │   ├── SlidesEditor.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.jsx
│   └── index.css
├── package.json
└── README.md
```

## 🔒 Stockage & Sécurité

- **localStorage** - Données stockées localement
- **10 MB maximum** - Limite de stockage
- **100% privé** - Aucun serveur externe
- **Zéro transmission** - Données ne quittent jamais votre navigateur

## 🐛 Troubleshooting

### L'app ne démarre pas
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
npm start
```

### Erreurs de build
```bash
# Nettoyer le cache
npm run build

# Réinstaller les dépendances
npm install
```

### Déploiement ne fonctionne pas

Vérifier:
1. GitHub Pages activé dans Settings
2. Homepage correcte dans package.json
3. Repository public (pas privé)
4. Branch main existe

```bash
# Vérifier la config
cat package.json | grep homepage
```

## 📱 Compatibilité

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🎯 Prochains Pas

- [ ] Ajouter plus de formats d'export (PDF, DOCX, XLSX)
- [ ] Collaboration temps réel
- [ ] Synchronisation cloud
- [ ] Thèmes personnalisés
- [ ] Plugins système

## 📄 Licence

MIT - Libre d'utilisation

## 🤝 Support

Pour tout problème:
1. Vérifiez le Troubleshooting
2. Consultez les issues GitHub
3. Créez une nouvelle issue

---

**Bon! DocFlow est prêt à être utilisé!** 🚀

Pour le déployer: `npm run deploy`
