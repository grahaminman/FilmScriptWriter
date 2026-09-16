import type { LocaleCode } from '../constants/screenplay'

export type MessageKey =
  | 'app.name'
  | 'app.tagline'
  | 'app.community'
  | 'app.freeNote'
  | 'app.licence'
  | 'menu.file'
  | 'menu.edit'
  | 'menu.view'
  | 'menu.export'
  | 'menu.theme'
  | 'menu.language'
  | 'menu.settings'
  | 'menu.help'
  | 'menu.file.new'
  | 'menu.file.newShort'
  | 'menu.file.newFeature'
  | 'menu.file.open'
  | 'menu.file.save'
  | 'menu.file.saveAs'
  | 'menu.file.quit'
  | 'menu.edit.undo'
  | 'menu.edit.redo'
  | 'menu.edit.cut'
  | 'menu.edit.copy'
  | 'menu.edit.paste'
  | 'menu.edit.selectAll'
  | 'menu.edit.find'
  | 'menu.edit.findReplace'
  | 'menu.edit.addToDictionary'
  | 'menu.view.files'
  | 'menu.view.preview'
  | 'menu.view.help'
  | 'menu.view.syntax'
  | 'menu.view.syntaxColors'
  | 'menu.view.fontIncrease'
  | 'menu.view.fontDecrease'
  | 'menu.view.fontReset'
  | 'menu.view.toggleDevTools'
  | 'menu.view.reload'
  | 'menu.export.fountain'
  | 'menu.export.pdf'
  | 'menu.theme.light'
  | 'menu.theme.dark'
  | 'menu.theme.system'
  | 'menu.language.en_GB'
  | 'menu.language.en_US'
  | 'menu.language.es_419'
  | 'menu.language.de_DE'
  | 'menu.language.fr_FR'
  | 'menu.language.it_IT'
  | 'menu.help.about'
  | 'menu.help.fountain'
  | 'menu.settings.open'
  | 'toolbar.new'
  | 'toolbar.open'
  | 'toolbar.save'
  | 'toolbar.saveAs'
  | 'toolbar.preview'
  | 'toolbar.settings'
  | 'files.title'
  | 'files.empty'
  | 'files.choose'
  | 'files.useDefault'
  | 'files.collapse'
  | 'files.expand'
  | 'files.refresh'
  | 'files.missingFolder'
  | 'settings.title'
  | 'settings.scriptsFolder'
  | 'settings.changeFolder'
  | 'settings.useDefault'
  | 'settings.autosave'
  | 'settings.autosaveOff'
  | 'settings.autosaveEvery'
  | 'settings.theme'
  | 'settings.uiLanguage'
  | 'settings.spellcheck'
  | 'settings.spellcheckEnabled'
  | 'settings.spellcheckHint'
  | 'settings.spellcheckDownload'
  | 'settings.spellcheckOpenFolder'
  | 'settings.spellcheckUrl'
  | 'settings.spellcheckUrlHint'
  | 'settings.spellcheckReady'
  | 'settings.spellcheckMissing'
  | 'settings.spellcheckDownloading'
  | 'settings.spellcheckDownloadDone'
  | 'settings.spellcheckDownloadFailed'
  | 'settings.spellcheckHunspellNote'
  | 'settings.syntaxColors'
  | 'settings.syntaxHint'
  | 'settings.syntaxEnabled'
  | 'settings.preset'
  | 'settings.preset.default'
  | 'settings.preset.highContrast'
  | 'settings.preset.soft'
  | 'settings.preset.custom'
  | 'settings.syntax.scene'
  | 'settings.syntax.action'
  | 'settings.syntax.character'
  | 'settings.syntax.parenthetical'
  | 'settings.syntax.dialogue'
  | 'settings.syntax.transition'
  | 'settings.syntax.lyrics'
  | 'settings.syntax.centered'
  | 'settings.syntax.section'
  | 'settings.syntax.note'
  | 'settings.syntax.boneyard'
  | 'settings.syntax.meta'
  | 'settings.syntax.pagebreak'
  | 'settings.resetColors'
  | 'settings.editorFont'
  | 'spell.en-GB'
  | 'spell.en-US'
  | 'spell.es-419'
  | 'spell.de-DE'
  | 'spell.fr-FR'
  | 'spell.it-IT'
  | 'dialog.unsaved.title'
  | 'dialog.unsaved.message'
  | 'dialog.unsaved.save'
  | 'dialog.unsaved.discard'
  | 'dialog.unsaved.cancel'
  | 'dialog.error.title'
  | 'dialog.about.title'
  | 'status.page'
  | 'status.pages'
  | 'status.ready'
  | 'status.modified'
  | 'status.saved'
  | 'status.untitled'
  | 'status.autosaved'
  | 'preview.title'
  | 'preview.empty'
  | 'help.title'
  | 'help.intro'
  | 'editor.placeholder'
  | 'common.ok'
  | 'common.cancel'
  | 'common.close'
  | 'common.choose'

export type Messages = Record<MessageKey, string>

const en_GB: Messages = {
  'app.name': 'FilmScriptWriter',
  'app.tagline':
    'UNLOCK YOUR STORY — Daily screenwriting practice. A complete short film, 2–5 pages a day.',
  'app.community': 'Community: filmscriptwriter-3192',
  'app.freeNote': 'Free with or without membership.',
  'app.licence': 'MIT Licence',
  'menu.file': 'File',
  'menu.edit': 'Edit',
  'menu.view': 'View',
  'menu.export': 'Export',
  'menu.theme': 'Theme',
  'menu.language': 'Language',
  'menu.settings': 'Settings',
  'menu.help': 'Help',
  'menu.file.new': 'New',
  'menu.file.newShort': 'New Short (Daily)…',
  'menu.file.newFeature': 'New Feature…',
  'menu.file.open': 'Open…',
  'menu.file.save': 'Save',
  'menu.file.saveAs': 'Save As…',
  'menu.file.quit': 'Quit',
  'menu.edit.undo': 'Undo',
  'menu.edit.redo': 'Redo',
  'menu.edit.cut': 'Cut',
  'menu.edit.copy': 'Copy',
  'menu.edit.paste': 'Paste',
  'menu.edit.selectAll': 'Select All',
  'menu.edit.find': 'Find',
  'menu.edit.findReplace': 'Find and Replace…',
  'menu.edit.addToDictionary': 'Add to dictionary',
  'menu.view.files': 'Scripts Folder',
  'menu.view.preview': 'Preview',
  'menu.view.help': 'Fountain Help',
  'menu.view.syntax': 'Syntax Colours',
  'menu.view.syntaxColors': 'Syntax Colours…',
  'menu.view.fontIncrease': 'Increase Font Size',
  'menu.view.fontDecrease': 'Decrease Font Size',
  'menu.view.fontReset': 'Reset Font Size',
  'menu.view.toggleDevTools': 'Toggle Developer Tools',
  'menu.view.reload': 'Reload',
  'menu.export.fountain': 'Export as Fountain…',
  'menu.export.pdf': 'Export as PDF…',
  'menu.theme.light': 'Light',
  'menu.theme.dark': 'Dark',
  'menu.theme.system': 'System',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.en_US': 'English (US)',
  'menu.language.es_419': 'Español (Latinoamérica)',
  'menu.language.de_DE': 'Deutsch',
  'menu.language.fr_FR': 'Français',
  'menu.language.it_IT': 'Italiano',
  'menu.help.about': 'About FilmScriptWriter',
  'menu.help.fountain': 'Fountain Syntax',
  'menu.settings.open': 'Settings…',
  'toolbar.new': 'New',
  'toolbar.open': 'Open',
  'toolbar.save': 'Save',
  'toolbar.saveAs': 'Save as',
  'toolbar.preview': 'Preview',
  'toolbar.settings': 'Settings',
  'files.title': 'Scripts',
  'files.empty': 'No .fountain or .txt files in this folder.',
  'files.choose': 'Choose a Scripts folder in Settings.',
  'files.useDefault': 'Use default folder',
  'files.collapse': 'Hide scripts list',
  'files.expand': 'Show scripts list',
  'files.refresh': 'Refresh list',
  'files.missingFolder': 'That folder is missing. Choose another in Settings.',
  'settings.title': 'Settings',
  'settings.scriptsFolder': 'Scripts folder',
  'settings.changeFolder': 'Choose…',
  'settings.useDefault': 'Use default',
  'settings.autosave': 'Autosave',
  'settings.autosaveOff': 'Off',
  'settings.autosaveEvery': 'Every {n} minutes',
  'settings.theme': 'Theme',
  'settings.uiLanguage': 'Interface language',
  'settings.spellcheck': 'Spell check',
  'settings.spellcheckEnabled': 'Enable spell check',
  'settings.spellcheckHint':
    'Misspellings are underlined as you type. Dictionaries stay on this computer so checking still works offline. Default is British English. Spell-check language is independent of the interface language.',
  'settings.spellcheckDownload': 'Download dictionaries',
  'settings.spellcheckOpenFolder': 'Open dictionaries folder',
  'settings.spellcheckUrl': 'Dictionary download URL (optional)',
  'settings.spellcheckUrlHint':
    'Leave blank to use the built-in sources. For a self-hosted copy, use a folder URL so the app can fetch en-GB.bdic and the other language files.',
  'settings.spellcheckReady': 'Ready',
  'settings.spellcheckMissing': 'Not downloaded',
  'settings.spellcheckDownloading': 'Downloading dictionaries…',
  'settings.spellcheckDownloadDone': 'Dictionaries saved on this computer.',
  'settings.spellcheckDownloadFailed':
    'Could not download one or more dictionaries. Copy .bdic files into the dictionaries folder, or set a self-hosted URL.',
  'settings.spellcheckHunspellNote':
    'Windows and Linux use these Hunspell files. macOS uses the system spell checker (macOS chooses the language).',
  'settings.syntaxColors': 'Syntax colours',
  'settings.syntaxHint':
    'Colours apply to the editor only. Preview stays black-and-white for print fidelity.',
  'settings.syntaxEnabled': 'Colour Fountain syntax in the editor',
  'settings.preset': 'Preset',
  'settings.preset.default': 'Default',
  'settings.preset.highContrast': 'High contrast',
  'settings.preset.soft': 'Soft',
  'settings.preset.custom': 'Custom',
  'settings.syntax.scene': 'Scene heading',
  'settings.syntax.action': 'Action',
  'settings.syntax.character': 'Character',
  'settings.syntax.parenthetical': 'Parenthetical',
  'settings.syntax.dialogue': 'Dialogue',
  'settings.syntax.transition': 'Transition',
  'settings.syntax.lyrics': 'Lyrics',
  'settings.syntax.centered': 'Centered',
  'settings.syntax.section': 'Section / synopsis',
  'settings.syntax.note': 'Note',
  'settings.syntax.boneyard': 'Boneyard',
  'settings.syntax.meta': 'Title page',
  'settings.syntax.pagebreak': 'Page break',
  'settings.resetColors': 'Reset to default',
  'settings.editorFont': 'Editor font size',
  'spell.en-GB': 'English (UK)',
  'spell.en-US': 'English (US)',
  'spell.es-419': 'Spanish (Latin America)',
  'spell.de-DE': 'German',
  'spell.fr-FR': 'French',
  'spell.it-IT': 'Italian',
  'dialog.unsaved.title': 'Unsaved Changes',
  'dialog.unsaved.message':
    'You have unsaved changes. Do you want to save them before continuing?',
  'dialog.unsaved.save': 'Save',
  'dialog.unsaved.discard': 'Discard',
  'dialog.unsaved.cancel': 'Cancel',
  'dialog.error.title': 'Error',
  'dialog.about.title': 'About FilmScriptWriter',
  'status.page': 'page',
  'status.pages': 'pages',
  'status.ready': 'Ready',
  'status.modified': 'Modified',
  'status.saved': 'Saved',
  'status.untitled': 'Untitled',
  'status.autosaved': 'Autosaved',
  'preview.title': 'Preview',
  'preview.empty': 'Your paginated screenplay preview will appear here.',
  'help.title': 'Fountain syntax',
  'help.intro':
    'A complete reference. Click an item in the list to jump. Switch back to Preview any time.',
  'editor.placeholder':
    'Start writing your screenplay in Fountain format…\n\nINT. COFFEE SHOP - DAY\n\nA quiet morning. SUNLIGHT streams through the windows.\n\nALICE\n(smiling)\nHello, world.',
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.choose': 'Choose…'
}

const en_US: Messages = {
  ...en_GB,
  'app.tagline':
    'UNLOCK YOUR STORY — Daily screenwriting practice. A complete short film, 2–5 pages a day.',
  'app.licence': 'MIT License',
  'settings.syntaxColors': 'Syntax colors',
  'settings.syntaxHint':
    'Colors apply to the editor only. Preview stays black-and-white for print fidelity.',
  'settings.syntaxEnabled': 'Color Fountain syntax in the editor',
  'menu.view.syntax': 'Syntax Colors',
  'menu.view.syntaxColors': 'Syntax Colors…',
  'menu.file.saveAs': 'Save As…',
  'toolbar.saveAs': 'Save as',
  'settings.spellcheckHint':
    'Misspellings are underlined as you type. Dictionaries stay on this computer so checking still works offline. Default is British English. Spell-check language is independent of the interface language.'
}

const es_419: Messages = {
  'app.name': 'FilmScriptWriter',
  'app.tagline':
    'UNLOCK YOUR STORY — Práctica diaria de guion. Un cortometraje completo, 2–5 páginas al día.',
  'app.community': 'Comunidad: filmscriptwriter-3192',
  'app.freeNote': 'Gratis con o sin membresía.',
  'app.licence': 'Licencia MIT',
  'menu.file': 'Archivo',
  'menu.edit': 'Editar',
  'menu.view': 'Ver',
  'menu.export': 'Exportar',
  'menu.theme': 'Tema',
  'menu.language': 'Idioma',
  'menu.settings': 'Ajustes',
  'menu.help': 'Ayuda',
  'menu.file.new': 'Nuevo',
  'menu.file.newShort': 'Nuevo corto (diario)…',
  'menu.file.newFeature': 'Nuevo largometraje…',
  'menu.file.open': 'Abrir…',
  'menu.file.save': 'Guardar',
  'menu.file.saveAs': 'Guardar como…',
  'menu.file.quit': 'Salir',
  'menu.edit.undo': 'Deshacer',
  'menu.edit.redo': 'Rehacer',
  'menu.edit.cut': 'Cortar',
  'menu.edit.copy': 'Copiar',
  'menu.edit.paste': 'Pegar',
  'menu.edit.selectAll': 'Seleccionar todo',
  'menu.edit.find': 'Buscar',
  'menu.edit.findReplace': 'Buscar y reemplazar…',
  'menu.edit.addToDictionary': 'Añadir al diccionario',
  'menu.view.files': 'Carpeta de guiones',
  'menu.view.preview': 'Vista previa',
  'menu.view.help': 'Ayuda Fountain',
  'menu.view.syntax': 'Colores de sintaxis',
  'menu.view.syntaxColors': 'Colores de sintaxis…',
  'menu.view.fontIncrease': 'Aumentar tamaño de fuente',
  'menu.view.fontDecrease': 'Reducir tamaño de fuente',
  'menu.view.fontReset': 'Restablecer tamaño de fuente',
  'menu.view.toggleDevTools': 'Herramientas de desarrollo',
  'menu.view.reload': 'Recargar',
  'menu.export.fountain': 'Exportar como Fountain…',
  'menu.export.pdf': 'Exportar como PDF…',
  'menu.theme.light': 'Claro',
  'menu.theme.dark': 'Oscuro',
  'menu.theme.system': 'Sistema',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.en_US': 'English (US)',
  'menu.language.es_419': 'Español (Latinoamérica)',
  'menu.language.de_DE': 'Deutsch',
  'menu.language.fr_FR': 'Français',
  'menu.language.it_IT': 'Italiano',
  'menu.help.about': 'Acerca de FilmScriptWriter',
  'menu.help.fountain': 'Sintaxis Fountain',
  'menu.settings.open': 'Ajustes…',
  'toolbar.new': 'Nuevo',
  'toolbar.open': 'Abrir',
  'toolbar.save': 'Guardar',
  'toolbar.saveAs': 'Guardar como',
  'toolbar.preview': 'Vista previa',
  'toolbar.settings': 'Ajustes',
  'files.title': 'Guiones',
  'files.empty': 'No hay archivos .fountain o .txt en esta carpeta.',
  'files.choose': 'Elija una carpeta de guiones en Ajustes.',
  'files.useDefault': 'Usar carpeta predeterminada',
  'files.collapse': 'Ocultar lista de guiones',
  'files.expand': 'Mostrar lista de guiones',
  'files.refresh': 'Actualizar lista',
  'files.missingFolder': 'Falta esa carpeta. Elija otra en Ajustes.',
  'settings.title': 'Ajustes',
  'settings.scriptsFolder': 'Carpeta de guiones',
  'settings.changeFolder': 'Elegir…',
  'settings.useDefault': 'Usar predeterminada',
  'settings.autosave': 'Autoguardado',
  'settings.autosaveOff': 'Desactivado',
  'settings.autosaveEvery': 'Cada {n} minutos',
  'settings.theme': 'Tema',
  'settings.uiLanguage': 'Idioma de la interfaz',
  'settings.spellcheck': 'Corrector ortográfico',
  'settings.spellcheckEnabled': 'Activar el corrector',
  'settings.spellcheckHint':
    'Las palabras mal escritas se subrayan al escribir. Los diccionarios quedan en esta computadora para funcionar sin conexión. El predeterminado es el inglés británico. El idioma del corrector es independiente del idioma de la interfaz.',
  'settings.spellcheckDownload': 'Descargar diccionarios',
  'settings.spellcheckOpenFolder': 'Abrir carpeta de diccionarios',
  'settings.spellcheckUrl': 'URL de descarga de diccionarios (opcional)',
  'settings.spellcheckUrlHint':
    'Déjela en blanco para usar las fuentes incluidas. Para una copia propia, use la URL de una carpeta de la que se puedan obtener en-GB.bdic y los demás idiomas.',
  'settings.spellcheckReady': 'Listo',
  'settings.spellcheckMissing': 'No descargado',
  'settings.spellcheckDownloading': 'Descargando diccionarios…',
  'settings.spellcheckDownloadDone': 'Diccionarios guardados en esta computadora.',
  'settings.spellcheckDownloadFailed':
    'No se pudo descargar uno o más diccionarios. Copie archivos .bdic en la carpeta o indique una URL propia.',
  'settings.spellcheckHunspellNote':
    'Windows y Linux usan estos archivos Hunspell. En macOS se usa el corrector del sistema (macOS elige el idioma).',
  'settings.syntaxColors': 'Colores de sintaxis',
  'settings.syntaxHint':
    'Los colores solo se aplican al editor. La vista previa permanece en blanco y negro.',
  'settings.syntaxEnabled': 'Colorear la sintaxis Fountain en el editor',
  'settings.preset': 'Preajuste',
  'settings.preset.default': 'Predeterminado',
  'settings.preset.highContrast': 'Alto contraste',
  'settings.preset.soft': 'Suave',
  'settings.preset.custom': 'Personalizado',
  'settings.syntax.scene': 'Encabezado de escena',
  'settings.syntax.action': 'Acción',
  'settings.syntax.character': 'Personaje',
  'settings.syntax.parenthetical': 'Acotación',
  'settings.syntax.dialogue': 'Diálogo',
  'settings.syntax.transition': 'Transición',
  'settings.syntax.lyrics': 'Letra',
  'settings.syntax.centered': 'Centrado',
  'settings.syntax.section': 'Sección / sinopsis',
  'settings.syntax.note': 'Nota',
  'settings.syntax.boneyard': 'Boneyard',
  'settings.syntax.meta': 'Portada',
  'settings.syntax.pagebreak': 'Salto de página',
  'settings.resetColors': 'Restablecer valores',
  'settings.editorFont': 'Tamaño de fuente del editor',
  'spell.en-GB': 'Inglés (Reino Unido)',
  'spell.en-US': 'Inglés (Estados Unidos)',
  'spell.es-419': 'Español (Latinoamérica)',
  'spell.de-DE': 'Alemán',
  'spell.fr-FR': 'Francés',
  'spell.it-IT': 'Italiano',
  'dialog.unsaved.title': 'Cambios sin guardar',
  'dialog.unsaved.message':
    'Hay cambios sin guardar. ¿Desea guardarlos antes de continuar?',
  'dialog.unsaved.save': 'Guardar',
  'dialog.unsaved.discard': 'Descartar',
  'dialog.unsaved.cancel': 'Cancelar',
  'dialog.error.title': 'Error',
  'dialog.about.title': 'Acerca de FilmScriptWriter',
  'status.page': 'página',
  'status.pages': 'páginas',
  'status.ready': 'Listo',
  'status.modified': 'Modificado',
  'status.saved': 'Guardado',
  'status.untitled': 'Sin título',
  'status.autosaved': 'Autoguardado',
  'preview.title': 'Vista previa',
  'preview.empty': 'La vista previa paginada del guion aparecerá aquí.',
  'help.title': 'Sintaxis Fountain',
  'help.intro':
    'Referencia completa. Pulse un elemento de la lista para saltar. Vuelva a la vista previa cuando quiera.',
  'editor.placeholder':
    'Empiece a escribir su guion en formato Fountain…\n\nINT. CAFETERÍA - DÍA\n\nUna mañana tranquila. La LUZ DEL SOL entra por las ventanas.\n\nALICIA\n(sonriendo)\nHola, mundo.',
  'common.ok': 'Aceptar',
  'common.cancel': 'Cancelar',
  'common.close': 'Cerrar',
  'common.choose': 'Elegir…'
}

const de_DE: Messages = {
  'app.name': 'FilmScriptWriter',
  'app.tagline':
    'UNLOCK YOUR STORY — Tägliches Drehbuchüben. Ein kompletter Kurzfilm, 2–5 Seiten am Tag.',
  'app.community': 'Community: filmscriptwriter-3192',
  'app.freeNote': 'Kostenlos mit oder ohne Mitgliedschaft.',
  'app.licence': 'MIT-Lizenz',
  'menu.file': 'Datei',
  'menu.edit': 'Bearbeiten',
  'menu.view': 'Ansicht',
  'menu.export': 'Exportieren',
  'menu.theme': 'Design',
  'menu.language': 'Sprache',
  'menu.settings': 'Einstellungen',
  'menu.help': 'Hilfe',
  'menu.file.new': 'Neu',
  'menu.file.newShort': 'Neuer Kurzfilm (täglich)…',
  'menu.file.newFeature': 'Neuer Langfilm…',
  'menu.file.open': 'Öffnen…',
  'menu.file.save': 'Speichern',
  'menu.file.saveAs': 'Speichern unter…',
  'menu.file.quit': 'Beenden',
  'menu.edit.undo': 'Rückgängig',
  'menu.edit.redo': 'Wiederholen',
  'menu.edit.cut': 'Ausschneiden',
  'menu.edit.copy': 'Kopieren',
  'menu.edit.paste': 'Einfügen',
  'menu.edit.selectAll': 'Alles auswählen',
  'menu.edit.find': 'Suchen',
  'menu.edit.findReplace': 'Suchen und ersetzen…',
  'menu.edit.addToDictionary': 'Zum Wörterbuch hinzufügen',
  'menu.view.files': 'Drehbuchordner',
  'menu.view.preview': 'Vorschau',
  'menu.view.help': 'Fountain-Hilfe',
  'menu.view.syntax': 'Syntaxfarben',
  'menu.view.syntaxColors': 'Syntaxfarben…',
  'menu.view.fontIncrease': 'Schrift vergrößern',
  'menu.view.fontDecrease': 'Schrift verkleinern',
  'menu.view.fontReset': 'Schriftgröße zurücksetzen',
  'menu.view.toggleDevTools': 'Entwicklertools',
  'menu.view.reload': 'Neu laden',
  'menu.export.fountain': 'Als Fountain exportieren…',
  'menu.export.pdf': 'Als PDF exportieren…',
  'menu.theme.light': 'Hell',
  'menu.theme.dark': 'Dunkel',
  'menu.theme.system': 'System',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.en_US': 'English (US)',
  'menu.language.es_419': 'Español (Latinoamérica)',
  'menu.language.de_DE': 'Deutsch',
  'menu.language.fr_FR': 'Français',
  'menu.language.it_IT': 'Italiano',
  'menu.help.about': 'Über FilmScriptWriter',
  'menu.help.fountain': 'Fountain-Syntax',
  'menu.settings.open': 'Einstellungen…',
  'toolbar.new': 'Neu',
  'toolbar.open': 'Öffnen',
  'toolbar.save': 'Speichern',
  'toolbar.saveAs': 'Speichern unter',
  'toolbar.preview': 'Vorschau',
  'toolbar.settings': 'Einstellungen',
  'files.title': 'Drehbücher',
  'files.empty': 'Keine .fountain- oder .txt-Dateien in diesem Ordner.',
  'files.choose': 'Wählen Sie in den Einstellungen einen Drehbuchordner.',
  'files.useDefault': 'Standardordner verwenden',
  'files.collapse': 'Liste ausblenden',
  'files.expand': 'Liste einblenden',
  'files.refresh': 'Liste aktualisieren',
  'files.missingFolder': 'Dieser Ordner fehlt. Wählen Sie einen anderen in den Einstellungen.',
  'settings.title': 'Einstellungen',
  'settings.scriptsFolder': 'Drehbuchordner',
  'settings.changeFolder': 'Wählen…',
  'settings.useDefault': 'Standard verwenden',
  'settings.autosave': 'Automatisch speichern',
  'settings.autosaveOff': 'Aus',
  'settings.autosaveEvery': 'Alle {n} Minuten',
  'settings.theme': 'Design',
  'settings.uiLanguage': 'Oberflächensprache',
  'settings.spellcheck': 'Rechtschreibung',
  'settings.spellcheckEnabled': 'Rechtschreibprüfung aktivieren',
  'settings.spellcheckHint':
    'Falsch geschriebene Wörter werden beim Tippen unterstrichen. Wörterbücher bleiben auf diesem Rechner, damit die Prüfung offline funktioniert. Standard ist britisches Englisch. Die Prüfsprache ist unabhängig von der Oberflächensprache.',
  'settings.spellcheckDownload': 'Wörterbücher herunterladen',
  'settings.spellcheckOpenFolder': 'Wörterbuchordner öffnen',
  'settings.spellcheckUrl': 'Download-URL für Wörterbücher (optional)',
  'settings.spellcheckUrlHint':
    'Leer lassen, um die eingebauten Quellen zu nutzen. Für eine eigene Kopie geben Sie eine Ordner-URL an, aus der en-GB.bdic und die anderen Sprachen geladen werden.',
  'settings.spellcheckReady': 'Bereit',
  'settings.spellcheckMissing': 'Nicht heruntergeladen',
  'settings.spellcheckDownloading': 'Wörterbücher werden heruntergeladen…',
  'settings.spellcheckDownloadDone': 'Wörterbücher auf diesem Rechner gespeichert.',
  'settings.spellcheckDownloadFailed':
    'Ein oder mehrere Wörterbücher konnten nicht geladen werden. Kopieren Sie .bdic-Dateien in den Ordner oder setzen Sie eine eigene URL.',
  'settings.spellcheckHunspellNote':
    'Windows und Linux nutzen diese Hunspell-Dateien. macOS nutzt die Systemprüfung (macOS wählt die Sprache).',
  'settings.syntaxColors': 'Syntaxfarben',
  'settings.syntaxHint':
    'Farben gelten nur für den Editor. Die Vorschau bleibt schwarz-weiß.',
  'settings.syntaxEnabled': 'Fountain-Syntax im Editor einfärben',
  'settings.preset': 'Voreinstellung',
  'settings.preset.default': 'Standard',
  'settings.preset.highContrast': 'Hoher Kontrast',
  'settings.preset.soft': 'Sanft',
  'settings.preset.custom': 'Benutzerdefiniert',
  'settings.syntax.scene': 'Szenenüberschrift',
  'settings.syntax.action': 'Handlung',
  'settings.syntax.character': 'Figur',
  'settings.syntax.parenthetical': 'Parenthese',
  'settings.syntax.dialogue': 'Dialog',
  'settings.syntax.transition': 'Übergang',
  'settings.syntax.lyrics': 'Liedtext',
  'settings.syntax.centered': 'Zentriert',
  'settings.syntax.section': 'Abschnitt / Synopsis',
  'settings.syntax.note': 'Notiz',
  'settings.syntax.boneyard': 'Boneyard',
  'settings.syntax.meta': 'Titelseite',
  'settings.syntax.pagebreak': 'Seitenumbruch',
  'settings.resetColors': 'Zurücksetzen',
  'settings.editorFont': 'Editor-Schriftgröße',
  'spell.en-GB': 'Englisch (UK)',
  'spell.en-US': 'Englisch (US)',
  'spell.es-419': 'Spanisch (Lateinamerika)',
  'spell.de-DE': 'Deutsch',
  'spell.fr-FR': 'Französisch',
  'spell.it-IT': 'Italienisch',
  'dialog.unsaved.title': 'Ungespeicherte Änderungen',
  'dialog.unsaved.message':
    'Es gibt ungespeicherte Änderungen. Möchten Sie sie speichern, bevor Sie fortfahren?',
  'dialog.unsaved.save': 'Speichern',
  'dialog.unsaved.discard': 'Verwerfen',
  'dialog.unsaved.cancel': 'Abbrechen',
  'dialog.error.title': 'Fehler',
  'dialog.about.title': 'Über FilmScriptWriter',
  'status.page': 'Seite',
  'status.pages': 'Seiten',
  'status.ready': 'Bereit',
  'status.modified': 'Geändert',
  'status.saved': 'Gespeichert',
  'status.untitled': 'Unbenannt',
  'status.autosaved': 'Automatisch gespeichert',
  'preview.title': 'Vorschau',
  'preview.empty': 'Die paginierte Drehbuchvorschau erscheint hier.',
  'help.title': 'Fountain-Syntax',
  'help.intro':
    'Eine vollständige Referenz. Klicken Sie einen Eintrag in der Liste an. Wechseln Sie jederzeit zurück zur Vorschau.',
  'editor.placeholder':
    'Beginnen Sie Ihr Drehbuch im Fountain-Format…\n\nINT. CAFÉ - TAG\n\nEin ruhiger Morgen. SONNENLICHT fällt durch die Fenster.\n\nALICE\n(lächelnd)\nHallo, Welt.',
  'common.ok': 'OK',
  'common.cancel': 'Abbrechen',
  'common.close': 'Schließen',
  'common.choose': 'Wählen…'
}

const fr_FR: Messages = {
  'app.name': 'FilmScriptWriter',
  'app.tagline':
    'UNLOCK YOUR STORY — Pratique quotidienne du scénario. Un court métrage complet, 2–5 pages par jour.',
  'app.community': 'Communauté : filmscriptwriter-3192',
  'app.freeNote': 'Gratuit avec ou sans adhésion.',
  'app.licence': 'Licence MIT',
  'menu.file': 'Fichier',
  'menu.edit': 'Édition',
  'menu.view': 'Affichage',
  'menu.export': 'Exporter',
  'menu.theme': 'Thème',
  'menu.language': 'Langue',
  'menu.settings': 'Réglages',
  'menu.help': 'Aide',
  'menu.file.new': 'Nouveau',
  'menu.file.newShort': 'Nouveau court (quotidien)…',
  'menu.file.newFeature': 'Nouveau long métrage…',
  'menu.file.open': 'Ouvrir…',
  'menu.file.save': 'Enregistrer',
  'menu.file.saveAs': 'Enregistrer sous…',
  'menu.file.quit': 'Quitter',
  'menu.edit.undo': 'Annuler',
  'menu.edit.redo': 'Rétablir',
  'menu.edit.cut': 'Couper',
  'menu.edit.copy': 'Copier',
  'menu.edit.paste': 'Coller',
  'menu.edit.selectAll': 'Tout sélectionner',
  'menu.edit.find': 'Rechercher',
  'menu.edit.findReplace': 'Rechercher et remplacer…',
  'menu.edit.addToDictionary': 'Ajouter au dictionnaire',
  'menu.view.files': 'Dossier des scénarios',
  'menu.view.preview': 'Aperçu',
  'menu.view.help': 'Aide Fountain',
  'menu.view.syntax': 'Couleurs de syntaxe',
  'menu.view.syntaxColors': 'Couleurs de syntaxe…',
  'menu.view.fontIncrease': 'Augmenter la taille de police',
  'menu.view.fontDecrease': 'Diminuer la taille de police',
  'menu.view.fontReset': 'Réinitialiser la taille de police',
  'menu.view.toggleDevTools': 'Outils de développement',
  'menu.view.reload': 'Recharger',
  'menu.export.fountain': 'Exporter en Fountain…',
  'menu.export.pdf': 'Exporter en PDF…',
  'menu.theme.light': 'Clair',
  'menu.theme.dark': 'Sombre',
  'menu.theme.system': 'Système',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.en_US': 'English (US)',
  'menu.language.es_419': 'Español (Latinoamérica)',
  'menu.language.de_DE': 'Deutsch',
  'menu.language.fr_FR': 'Français',
  'menu.language.it_IT': 'Italiano',
  'menu.help.about': 'À propos de FilmScriptWriter',
  'menu.help.fountain': 'Syntaxe Fountain',
  'menu.settings.open': 'Réglages…',
  'toolbar.new': 'Nouveau',
  'toolbar.open': 'Ouvrir',
  'toolbar.save': 'Enregistrer',
  'toolbar.saveAs': 'Enregistrer sous',
  'toolbar.preview': 'Aperçu',
  'toolbar.settings': 'Réglages',
  'files.title': 'Scénarios',
  'files.empty': 'Aucun fichier .fountain ou .txt dans ce dossier.',
  'files.choose': 'Choisissez un dossier de scénarios dans Réglages.',
  'files.useDefault': 'Utiliser le dossier par défaut',
  'files.collapse': 'Masquer la liste',
  'files.expand': 'Afficher la liste',
  'files.refresh': 'Actualiser la liste',
  'files.missingFolder': 'Ce dossier est introuvable. Choisissez-en un autre dans Réglages.',
  'settings.title': 'Réglages',
  'settings.scriptsFolder': 'Dossier des scénarios',
  'settings.changeFolder': 'Choisir…',
  'settings.useDefault': 'Utiliser le défaut',
  'settings.autosave': 'Enregistrement automatique',
  'settings.autosaveOff': 'Désactivé',
  'settings.autosaveEvery': 'Toutes les {n} minutes',
  'settings.theme': 'Thème',
  'settings.uiLanguage': 'Langue de l’interface',
  'settings.spellcheck': 'Correcteur orthographique',
  'settings.spellcheckEnabled': 'Activer le correcteur',
  'settings.spellcheckHint':
    'Les fautes sont soulignées pendant la saisie. Les dictionnaires restent sur cet ordinateur pour fonctionner hors ligne. L’anglais britannique est la langue par défaut. La langue du correcteur est indépendante de celle de l’interface.',
  'settings.spellcheckDownload': 'Télécharger les dictionnaires',
  'settings.spellcheckOpenFolder': 'Ouvrir le dossier des dictionnaires',
  'settings.spellcheckUrl': 'URL de téléchargement des dictionnaires (facultatif)',
  'settings.spellcheckUrlHint':
    'Laissez vide pour utiliser les sources intégrées. Pour une copie auto-hébergée, indiquez l’URL d’un dossier d’où l’application peut récupérer en-GB.bdic et les autres langues.',
  'settings.spellcheckReady': 'Prêt',
  'settings.spellcheckMissing': 'Non téléchargé',
  'settings.spellcheckDownloading': 'Téléchargement des dictionnaires…',
  'settings.spellcheckDownloadDone': 'Dictionnaires enregistrés sur cet ordinateur.',
  'settings.spellcheckDownloadFailed':
    'Impossible de télécharger un ou plusieurs dictionnaires. Copiez des fichiers .bdic dans le dossier, ou indiquez une URL auto-hébergée.',
  'settings.spellcheckHunspellNote':
    'Windows et Linux utilisent ces fichiers Hunspell. macOS utilise le correcteur du système (macOS choisit la langue).',
  'settings.syntaxColors': 'Couleurs de syntaxe',
  'settings.syntaxHint':
    'Les couleurs s’appliquent uniquement à l’éditeur. L’aperçu reste en noir et blanc.',
  'settings.syntaxEnabled': 'Colorer la syntaxe Fountain dans l’éditeur',
  'settings.preset': 'Préréglage',
  'settings.preset.default': 'Par défaut',
  'settings.preset.highContrast': 'Contraste élevé',
  'settings.preset.soft': 'Doux',
  'settings.preset.custom': 'Personnalisé',
  'settings.syntax.scene': 'Intitulé de scène',
  'settings.syntax.action': 'Action',
  'settings.syntax.character': 'Personnage',
  'settings.syntax.parenthetical': 'Incise',
  'settings.syntax.dialogue': 'Dialogue',
  'settings.syntax.transition': 'Transition',
  'settings.syntax.lyrics': 'Paroles',
  'settings.syntax.centered': 'Centré',
  'settings.syntax.section': 'Section / synopsis',
  'settings.syntax.note': 'Note',
  'settings.syntax.boneyard': 'Boneyard',
  'settings.syntax.meta': 'Page de titre',
  'settings.syntax.pagebreak': 'Saut de page',
  'settings.resetColors': 'Réinitialiser',
  'settings.editorFont': 'Taille de police de l’éditeur',
  'spell.en-GB': 'Anglais (Royaume-Uni)',
  'spell.en-US': 'Anglais (États-Unis)',
  'spell.es-419': 'Espagnol (Amérique latine)',
  'spell.de-DE': 'Allemand',
  'spell.fr-FR': 'Français',
  'spell.it-IT': 'Italien',
  'dialog.unsaved.title': 'Modifications non enregistrées',
  'dialog.unsaved.message':
    'Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de continuer ?',
  'dialog.unsaved.save': 'Enregistrer',
  'dialog.unsaved.discard': 'Abandonner',
  'dialog.unsaved.cancel': 'Annuler',
  'dialog.error.title': 'Erreur',
  'dialog.about.title': 'À propos de FilmScriptWriter',
  'status.page': 'page',
  'status.pages': 'pages',
  'status.ready': 'Prêt',
  'status.modified': 'Modifié',
  'status.saved': 'Enregistré',
  'status.untitled': 'Sans titre',
  'status.autosaved': 'Enregistré automatiquement',
  'preview.title': 'Aperçu',
  'preview.empty': 'L’aperçu paginé de votre scénario apparaîtra ici.',
  'help.title': 'Syntaxe Fountain',
  'help.intro':
    'Une référence complète. Cliquez un élément de la liste pour y aller. Revenez à l’aperçu à tout moment.',
  'editor.placeholder':
    'Commencez à écrire votre scénario au format Fountain…\n\nINT. CAFÉ - JOUR\n\nUn matin calme. La LUMIÈRE DU SOLEIL entre par les fenêtres.\n\nALICE\n(souriante)\nBonjour le monde.',
  'common.ok': 'OK',
  'common.cancel': 'Annuler',
  'common.close': 'Fermer',
  'common.choose': 'Choisir…'
}

const it_IT: Messages = {
  'app.name': 'FilmScriptWriter',
  'app.tagline':
    'UNLOCK YOUR STORY — Pratica quotidiana di sceneggiatura. Un cortometraggio completo, 2–5 pagine al giorno.',
  'app.community': 'Community: filmscriptwriter-3192',
  'app.freeNote': 'Gratuito con o senza iscrizione.',
  'app.licence': 'Licenza MIT',
  'menu.file': 'File',
  'menu.edit': 'Modifica',
  'menu.view': 'Visualizza',
  'menu.export': 'Esporta',
  'menu.theme': 'Tema',
  'menu.language': 'Lingua',
  'menu.settings': 'Impostazioni',
  'menu.help': 'Aiuto',
  'menu.file.new': 'Nuovo',
  'menu.file.newShort': 'Nuovo corto (quotidiano)…',
  'menu.file.newFeature': 'Nuovo lungometraggio…',
  'menu.file.open': 'Apri…',
  'menu.file.save': 'Salva',
  'menu.file.saveAs': 'Salva come…',
  'menu.file.quit': 'Esci',
  'menu.edit.undo': 'Annulla',
  'menu.edit.redo': 'Ripeti',
  'menu.edit.cut': 'Taglia',
  'menu.edit.copy': 'Copia',
  'menu.edit.paste': 'Incolla',
  'menu.edit.selectAll': 'Seleziona tutto',
  'menu.edit.find': 'Trova',
  'menu.edit.findReplace': 'Trova e sostituisci…',
  'menu.edit.addToDictionary': 'Aggiungi al dizionario',
  'menu.view.files': 'Cartella sceneggiature',
  'menu.view.preview': 'Anteprima',
  'menu.view.help': 'Guida Fountain',
  'menu.view.syntax': 'Colori della sintassi',
  'menu.view.syntaxColors': 'Colori della sintassi…',
  'menu.view.fontIncrease': 'Aumenta dimensione carattere',
  'menu.view.fontDecrease': 'Riduci dimensione carattere',
  'menu.view.fontReset': 'Reimposta dimensione carattere',
  'menu.view.toggleDevTools': 'Strumenti di sviluppo',
  'menu.view.reload': 'Ricarica',
  'menu.export.fountain': 'Esporta come Fountain…',
  'menu.export.pdf': 'Esporta come PDF…',
  'menu.theme.light': 'Chiaro',
  'menu.theme.dark': 'Scuro',
  'menu.theme.system': 'Sistema',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.en_US': 'English (US)',
  'menu.language.es_419': 'Español (Latinoamérica)',
  'menu.language.de_DE': 'Deutsch',
  'menu.language.fr_FR': 'Français',
  'menu.language.it_IT': 'Italiano',
  'menu.help.about': 'Informazioni su FilmScriptWriter',
  'menu.help.fountain': 'Sintassi Fountain',
  'menu.settings.open': 'Impostazioni…',
  'toolbar.new': 'Nuovo',
  'toolbar.open': 'Apri',
  'toolbar.save': 'Salva',
  'toolbar.saveAs': 'Salva come',
  'toolbar.preview': 'Anteprima',
  'toolbar.settings': 'Impostazioni',
  'files.title': 'Sceneggiature',
  'files.empty': 'Nessun file .fountain o .txt in questa cartella.',
  'files.choose': 'Scegli una cartella delle sceneggiature in Impostazioni.',
  'files.useDefault': 'Usa cartella predefinita',
  'files.collapse': 'Nascondi elenco',
  'files.expand': 'Mostra elenco',
  'files.refresh': 'Aggiorna elenco',
  'files.missingFolder': 'Cartella mancante. Scegline un’altra in Impostazioni.',
  'settings.title': 'Impostazioni',
  'settings.scriptsFolder': 'Cartella delle sceneggiature',
  'settings.changeFolder': 'Scegli…',
  'settings.useDefault': 'Usa predefinita',
  'settings.autosave': 'Salvataggio automatico',
  'settings.autosaveOff': 'Disattivato',
  'settings.autosaveEvery': 'Ogni {n} minuti',
  'settings.theme': 'Tema',
  'settings.uiLanguage': 'Lingua dell’interfaccia',
  'settings.spellcheck': 'Controllo ortografico',
  'settings.spellcheckEnabled': 'Attiva il controllo ortografico',
  'settings.spellcheckHint':
    'Gli errori sono sottolineati mentre scrivi. I dizionari restano su questo computer per funzionare offline. L’inglese britannico è la lingua predefinita. La lingua del correttore è indipendente da quella dell’interfaccia.',
  'settings.spellcheckDownload': 'Scarica dizionari',
  'settings.spellcheckOpenFolder': 'Apri cartella dizionari',
  'settings.spellcheckUrl': 'URL di download dei dizionari (facoltativo)',
  'settings.spellcheckUrlHint':
    'Lascia vuoto per usare le fonti integrate. Per una copia propria, indica l’URL di una cartella da cui l’app può recuperare en-GB.bdic e le altre lingue.',
  'settings.spellcheckReady': 'Pronto',
  'settings.spellcheckMissing': 'Non scaricato',
  'settings.spellcheckDownloading': 'Download dei dizionari…',
  'settings.spellcheckDownloadDone': 'Dizionari salvati su questo computer.',
  'settings.spellcheckDownloadFailed':
    'Impossibile scaricare uno o più dizionari. Copia i file .bdic nella cartella oppure imposta un URL proprio.',
  'settings.spellcheckHunspellNote':
    'Windows e Linux usano questi file Hunspell. macOS usa il correttore di sistema (macOS sceglie la lingua).',
  'settings.syntaxColors': 'Colori della sintassi',
  'settings.syntaxHint':
    'I colori si applicano solo all’editor. L’anteprima resta in bianco e nero.',
  'settings.syntaxEnabled': 'Colora la sintassi Fountain nell’editor',
  'settings.preset': 'Preimpostazione',
  'settings.preset.default': 'Predefinito',
  'settings.preset.highContrast': 'Alto contrasto',
  'settings.preset.soft': 'Morbido',
  'settings.preset.custom': 'Personalizzato',
  'settings.syntax.scene': 'Intestazione di scena',
  'settings.syntax.action': 'Azione',
  'settings.syntax.character': 'Personaggio',
  'settings.syntax.parenthetical': 'Inciso',
  'settings.syntax.dialogue': 'Dialogo',
  'settings.syntax.transition': 'Transizione',
  'settings.syntax.lyrics': 'Testo cantato',
  'settings.syntax.centered': 'Centrato',
  'settings.syntax.section': 'Sezione / sinossi',
  'settings.syntax.note': 'Nota',
  'settings.syntax.boneyard': 'Boneyard',
  'settings.syntax.meta': 'Frontespizio',
  'settings.syntax.pagebreak': 'Interruzione di pagina',
  'settings.resetColors': 'Ripristina',
  'settings.editorFont': 'Dimensione carattere dell’editor',
  'spell.en-GB': 'Inglese (Regno Unito)',
  'spell.en-US': 'Inglese (Stati Uniti)',
  'spell.es-419': 'Spagnolo (America Latina)',
  'spell.de-DE': 'Tedesco',
  'spell.fr-FR': 'Francese',
  'spell.it-IT': 'Italiano',
  'dialog.unsaved.title': 'Modifiche non salvate',
  'dialog.unsaved.message':
    'Ci sono modifiche non salvate. Vuoi salvarle prima di continuare?',
  'dialog.unsaved.save': 'Salva',
  'dialog.unsaved.discard': 'Scarta',
  'dialog.unsaved.cancel': 'Annulla',
  'dialog.error.title': 'Errore',
  'dialog.about.title': 'Informazioni su FilmScriptWriter',
  'status.page': 'pagina',
  'status.pages': 'pagine',
  'status.ready': 'Pronto',
  'status.modified': 'Modificato',
  'status.saved': 'Salvato',
  'status.untitled': 'Senza titolo',
  'status.autosaved': 'Salvato automaticamente',
  'preview.title': 'Anteprima',
  'preview.empty': 'L’anteprima impaginata della sceneggiatura apparirà qui.',
  'help.title': 'Sintassi Fountain',
  'help.intro':
    'Un riferimento completo. Fai clic su una voce dell’elenco per saltare. Torna all’anteprima quando vuoi.',
  'editor.placeholder':
    'Inizia a scrivere la sceneggiatura in formato Fountain…\n\nINT. CAFFÈ - GIORNO\n\nUna mattina tranquilla. La LUCE DEL SOLE entra dalle finestre.\n\nALICE\n(sorridendo)\nCiao, mondo.',
  'common.ok': 'OK',
  'common.cancel': 'Annulla',
  'common.close': 'Chiudi',
  'common.choose': 'Scegli…'
}

export const LOCALES: Record<LocaleCode, Messages> = {
  en_GB,
  en_US,
  es_419,
  de_DE,
  fr_FR,
  it_IT
}

export const LOCALE_LABEL_KEYS: Record<LocaleCode, MessageKey> = {
  en_GB: 'menu.language.en_GB',
  en_US: 'menu.language.en_US',
  es_419: 'menu.language.es_419',
  de_DE: 'menu.language.de_DE',
  fr_FR: 'menu.language.fr_FR',
  it_IT: 'menu.language.it_IT'
}

export function isLocaleCode(value: string): value is LocaleCode {
  return value in LOCALES
}

export function t(
  locale: LocaleCode,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let s = LOCALES[locale]?.[key] ?? LOCALES.en_GB[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}
