/**
 * Application strings for en_GB, es_PY and fr_FR.
 *
 * Keys are stable identifiers used by menus, dialogs and the status bar.
 * The renderer and main process both import from here so menus stay in sync.
 */

import type { LocaleCode } from '../constants/screenplay'

export type MessageKey =
  | 'app.name'
  | 'app.tagline'
  | 'menu.file'
  | 'menu.edit'
  | 'menu.view'
  | 'menu.export'
  | 'menu.theme'
  | 'menu.language'
  | 'menu.settings'
  | 'menu.help'
  | 'menu.file.new'
  | 'menu.file.newProject'
  | 'menu.file.closeProject'
  | 'menu.file.open'
  | 'menu.file.openProject'
  | 'menu.file.importDraft'
  | 'menu.file.importNotes'
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
  | 'menu.view.preview'
  | 'menu.view.syntaxHelp'
  | 'menu.view.index'
  | 'menu.view.notes'
  | 'menu.view.syntaxCoach'
  | 'menu.view.split1'
  | 'menu.view.split2'
  | 'menu.view.split3'
  | 'menu.view.previewFollow'
  | 'menu.view.typewriter'
  | 'menu.view.syntax'
  | 'menu.view.syntaxColors'
  | 'menu.view.fontIncrease'
  | 'menu.view.fontDecrease'
  | 'menu.view.fontReset'
  | 'menu.view.toggleDevTools'
  | 'menu.view.reload'
  | 'menu.export.fountain'
  | 'menu.export.fdx'
  | 'menu.export.pdf'
  | 'menu.theme.light'
  | 'menu.theme.dark'
  | 'menu.theme.system'
  | 'menu.language.en_GB'
  | 'menu.language.es_PY'
  | 'menu.language.fr_FR'
  | 'menu.help.about'
  | 'menu.help.guide'
  | 'menu.help.checkUpdates'
  | 'menu.settings.workspace'
  | 'menu.settings.spellcheck'
  | 'menu.edit.addToDictionary'
  | 'settings.title'
  | 'settings.baseFolder'
  | 'settings.changeFolder'
  | 'settings.autosave'
  | 'settings.autosaveOff'
  | 'settings.autosaveEvery'
  | 'settings.template'
  | 'settings.templateHint'
  | 'settings.templateChoose'
  | 'settings.templateSave'
  | 'settings.templateRevert'
  | 'settings.templateSelectAll'
  | 'settings.templateUnsaved'
  | 'settings.templateSaved'
  | 'settings.templateReverted'
  | 'settings.spellcheck'
  | 'settings.spellcheckEnabled'
  | 'settings.spellcheckHint'
  | 'settings.spellcheckEnGB'
  | 'settings.spellcheckEnUS'
  | 'settings.spellcheckEs'
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
  | 'firstRun.title'
  | 'firstRun.body'
  | 'firstRun.chooseFolder'
  | 'firstRun.projectName'
  | 'firstRun.create'
  | 'dialog.newProject.hint'
  | 'notes.title'
  | 'notes.empty'
  | 'notes.add'
  | 'index.title'
  | 'index.search'
  | 'index.scenes'
  | 'index.characters'
  | 'index.notes'
  | 'index.files'
  | 'index.empty'
  | 'help.title'
  | 'help.search'
  | 'help.empty'
  | 'status.autosaved'
  | 'welcome.firstRun'
  | 'dialog.unsaved.title'
  | 'dialog.unsaved.message'
  | 'dialog.unsaved.save'
  | 'dialog.unsaved.discard'
  | 'dialog.unsaved.cancel'
  | 'dialog.error.title'
  | 'dialog.about.title'
  | 'dialog.about.message'
  | 'status.words'
  | 'status.pages'
  | 'status.ready'
  | 'status.modified'
  | 'status.saved'
  | 'status.untitled'
  | 'status.font'
  | 'status.find'
  | 'status.replace'
  | 'preview.title'
  | 'preview.empty'
  | 'editor.placeholder'
  | 'welcome.title'
  | 'welcome.body'
  | 'common.ok'
  | 'common.cancel'
  | 'common.close'
  | 'update.checking'
  | 'update.available'
  | 'update.none'
  | 'update.error'
  | 'settings.syntaxColors'
  | 'settings.syntaxHint'
  | 'settings.preset'
  | 'settings.resetColors'

export type Messages = Record<MessageKey, string>

const en_GB: Messages = {
  'app.name': 'FilmScriptWriter (Beta)',
  'app.tagline': 'Beta preview — Fountain screenplay editing',
  'menu.file': 'File',
  'menu.edit': 'Edit',
  'menu.view': 'View',
  'menu.export': 'Export',
  'menu.theme': 'Theme',
  'menu.language': 'Language',
  'menu.settings': 'Settings',
  'menu.help': 'Help',
  'menu.file.new': 'New Untitled',
  'menu.file.newProject': 'New Project…',
  'menu.file.closeProject': 'Close Project',
  'menu.file.open': 'Open File…',
  'menu.file.openProject': 'Open Project…',
  'menu.file.importDraft': 'Import as Current Draft…',
  'menu.file.importNotes': 'Import as Notes…',
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
  'menu.view.preview': 'Toggle Preview',
  'menu.view.syntaxHelp': 'Fountain Syntax Help',
  'menu.view.index': 'Index Sidebar',
  'menu.view.notes': 'Notes Sidebar',
  'menu.view.syntaxCoach': 'Fountain Help Bar',
  'menu.view.split1': 'One Pane',
  'menu.view.split2': 'Two Panes',
  'menu.view.split3': 'Three Panes',
  'menu.view.previewFollow': 'Preview Follows Editor',
  'menu.view.typewriter': 'Typewriter Mode',
  'menu.view.syntax': 'Syntax Highlighting',
  'menu.view.syntaxColors': 'Syntax Colours…',
  'menu.view.fontIncrease': 'Increase Font Size',
  'menu.view.fontDecrease': 'Decrease Font Size',
  'menu.view.fontReset': 'Reset Font Size',
  'menu.view.toggleDevTools': 'Toggle Developer Tools',
  'menu.view.reload': 'Reload',
  'menu.export.fountain': 'Export as Fountain…',
  'menu.export.fdx': 'Export as Final Draft (.fdx)…',
  'menu.export.pdf': 'Export as PDF…',
  'menu.theme.light': 'Light',
  'menu.theme.dark': 'Dark',
  'menu.theme.system': 'System',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.es_PY': 'Español (Paraguay)',
  'menu.language.fr_FR': 'Français (France)',
  'menu.help.about': 'About',
  'menu.help.guide': 'Help and Instructions…',
  'menu.help.checkUpdates': 'Check for Updates…',
  'menu.settings.workspace': 'Projects, Autosave and Template…',
  'menu.settings.spellcheck': 'Spell check',
  'menu.edit.addToDictionary': 'Add to dictionary',
  'settings.title': 'Settings',
  'settings.baseFolder': 'Projects folder',
  'settings.changeFolder': 'Change…',
  'settings.autosave': 'Autosave',
  'settings.autosaveOff': 'Off',
  'settings.autosaveEvery': 'Every {n} minutes',
  'settings.template': 'New project template',
  'settings.templateHint':
    'This Fountain file is copied into every new project. Edit it here, or choose one of your own. A factory copy is kept so you can revert.',
  'settings.templateChoose': 'Use my file…',
  'settings.templateSave': 'Save template',
  'settings.templateRevert': 'Revert to original',
  'settings.templateSelectAll': 'Select all',
  'settings.templateUnsaved':
    'The template has unsaved edits. Close Settings and discard them?',
  'settings.templateSaved': 'Template saved. New projects will use this file.',
  'settings.templateReverted': 'Template restored to the original starter.',
  'settings.spellcheck': 'Spell check',
  'settings.spellcheckEnabled': 'Enable spell check',
  'settings.spellcheckHint':
    'Misspellings are underlined as you type. Dictionaries are stored on this computer so checking still works offline. Default is British English.',
  'settings.spellcheckEnGB': 'English (UK)',
  'settings.spellcheckEnUS': 'English (US)',
  'settings.spellcheckEs': 'Spanish (Latin America / Paraguay)',
  'settings.spellcheckDownload': 'Download dictionaries',
  'settings.spellcheckOpenFolder': 'Open dictionaries folder',
  'settings.spellcheckUrl': 'Dictionary download URL (optional)',
  'settings.spellcheckUrlHint':
    'Leave blank to use the built-in sources. For a self-hosted copy, use a folder URL so the app can fetch en-GB.bdic, en-US.bdic and es-419.bdic.',
  'settings.spellcheckReady': 'Ready',
  'settings.spellcheckMissing': 'Not downloaded',
  'settings.spellcheckDownloading': 'Downloading dictionaries…',
  'settings.spellcheckDownloadDone': 'Dictionaries saved on this computer.',
  'settings.spellcheckDownloadFailed':
    'Could not download one or more dictionaries. Copy .bdic files into the dictionaries folder, or set a self-hosted URL.',
  'settings.spellcheckHunspellNote':
    'Windows and Linux use these Hunspell files. macOS uses the system spell checker (macOS chooses the language).',
  'firstRun.title': 'Where should your projects live?',
  'firstRun.body':
    'Choose a base folder for every screenplay. Each project gets its own folder. You can change this later in Settings.',
  'firstRun.chooseFolder': 'Choose folder…',
  'firstRun.projectName': 'Project name',
  'firstRun.create': 'Create project',
  'dialog.newProject.hint':
    'This closes the current project and creates a new folder with a dated draft.',
  'notes.title': 'Notes',
  'notes.empty': 'No notes yet. Type [[ Note 1]] in the script or add a note here.',
  'notes.add': 'Add note',
  'index.title': 'Index',
  'index.search': 'Search index…',
  'index.scenes': 'Scenes',
  'index.characters': 'Characters',
  'index.notes': 'Notes',
  'index.files': 'Files',
  'index.empty': 'Nothing matches.',
  'help.title': 'Help',
  'help.search': 'Search help…',
  'help.empty': 'No articles match that search.',
  'status.autosaved': 'Autosaved',
  'welcome.firstRun': 'Set up your projects folder, then name the first screenplay.',
  'dialog.unsaved.title': 'Unsaved Changes',
  'dialog.unsaved.message':
    'You have unsaved changes. Do you want to save them before continuing?',
  'dialog.unsaved.save': 'Save',
  'dialog.unsaved.discard': 'Discard',
  'dialog.unsaved.cancel': 'Cancel',
  'dialog.error.title': 'Error',
  'dialog.about.title': 'About FilmScriptWriter (Beta)',
  'dialog.about.message':
    'FilmScriptWriter is a BETA preview of a Fountain screenplay editor (Hollywood pagination, PDF/FDX export, live preview). Features may change; not yet a finished product.',
  'status.words': 'Words',
  'status.pages': 'Pages',
  'status.ready': 'Ready',
  'status.modified': 'Modified',
  'status.saved': 'Saved',
  'status.untitled': 'Untitled',
  'status.font': 'Font',
  'status.find': 'Find',
  'status.replace': 'Replace',
  'preview.title': 'Preview',
  'preview.empty': 'Your paginated screenplay preview will appear here.',
  'editor.placeholder':
    'Start writing your screenplay in Fountain format…\n\nINT. COFFEE SHOP - DAY\n\nA quiet morning. SUNLIGHT streams through the windows.\n\nALICE\n(smiling)\nHello, world.',
  'welcome.title': 'Welcome',
  'welcome.body':
    'Create a new project, or open a project folder / .fountain file to begin.',
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'update.checking': 'Checking for updates…',
  'update.available': 'An update is available.',
  'update.none': 'You are on the latest version.',
  'update.error': 'Could not check for updates.',
  'settings.syntaxColors': 'Syntax colours',
  'settings.syntaxHint':
    'Colours apply to the editor only. Preview stays black-and-white for print fidelity.',
  'settings.preset': 'Preset',
  'settings.resetColors': 'Reset to default'
}

const es_PY: Messages = {
  'app.name': 'FilmScriptWriter (Beta)',
  'app.tagline': 'Vista previa beta — guiones Fountain',
  'menu.file': 'Archivo',
  'menu.edit': 'Editar',
  'menu.view': 'Ver',
  'menu.export': 'Exportar',
  'menu.theme': 'Tema',
  'menu.language': 'Idioma',
  'menu.settings': 'Ajustes',
  'menu.help': 'Ayuda',
  'menu.file.new': 'Nuevo sin título',
  'menu.file.newProject': 'Proyecto nuevo…',
  'menu.file.closeProject': 'Cerrar proyecto',
  'menu.file.open': 'Abrir archivo…',
  'menu.file.openProject': 'Abrir proyecto…',
  'menu.file.importDraft': 'Importar como borrador actual…',
  'menu.file.importNotes': 'Importar como notas…',
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
  'menu.view.preview': 'Alternar vista previa',
  'menu.view.syntaxHelp': 'Ayuda de sintaxis Fountain',
  'menu.view.index': 'Índice',
  'menu.view.notes': 'Notas',
  'menu.view.syntaxCoach': 'Barra de ayuda Fountain',
  'menu.view.split1': 'Un panel',
  'menu.view.split2': 'Dos paneles',
  'menu.view.split3': 'Tres paneles',
  'menu.view.previewFollow': 'Vista previa sigue al editor',
  'menu.view.typewriter': 'Modo máquina de escribir',
  'menu.view.syntax': 'Resaltado de sintaxis',
  'menu.view.syntaxColors': 'Colores de sintaxis…',
  'menu.view.fontIncrease': 'Aumentar tamaño de fuente',
  'menu.view.fontDecrease': 'Reducir tamaño de fuente',
  'menu.view.fontReset': 'Restablecer tamaño de fuente',
  'menu.view.toggleDevTools': 'Herramientas de desarrollo',
  'menu.view.reload': 'Recargar',
  'menu.export.fountain': 'Exportar como Fountain…',
  'menu.export.fdx': 'Exportar como Final Draft (.fdx)…',
  'menu.export.pdf': 'Exportar como PDF…',
  'menu.theme.light': 'Claro',
  'menu.theme.dark': 'Oscuro',
  'menu.theme.system': 'Sistema',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.es_PY': 'Español (Paraguay)',
  'menu.language.fr_FR': 'Français (France)',
  'menu.help.about': 'Acerca de',
  'menu.help.guide': 'Ayuda e instrucciones…',
  'menu.help.checkUpdates': 'Buscar actualizaciones…',
  'menu.settings.workspace': 'Proyectos, autoguardado y plantilla…',
  'menu.settings.spellcheck': 'Corrector ortográfico',
  'menu.edit.addToDictionary': 'Añadir al diccionario',
  'settings.title': 'Ajustes',
  'settings.baseFolder': 'Carpeta de proyectos',
  'settings.changeFolder': 'Cambiar…',
  'settings.autosave': 'Autoguardado',
  'settings.autosaveOff': 'Desactivado',
  'settings.autosaveEvery': 'Cada {n} minutos',
  'settings.template': 'Plantilla de proyecto nuevo',
  'settings.templateHint':
    'Este archivo Fountain se copia en cada proyecto nuevo. Edítelo aquí o elija el suyo. Se guarda una copia de fábrica para revertir.',
  'settings.templateChoose': 'Usar mi archivo…',
  'settings.templateSave': 'Guardar plantilla',
  'settings.templateRevert': 'Revertir al original',
  'settings.templateSelectAll': 'Seleccionar todo',
  'settings.templateUnsaved':
    'La plantilla tiene cambios sin guardar. ¿Cerrar Ajustes y descartarlos?',
  'settings.templateSaved': 'Plantilla guardada. Los proyectos nuevos la usarán.',
  'settings.templateReverted': 'Plantilla restaurada al modelo original.',
  'settings.spellcheck': 'Corrector ortográfico',
  'settings.spellcheckEnabled': 'Activar el corrector',
  'settings.spellcheckHint':
    'Las palabras mal escritas se subrayan al escribir. Los diccionarios se guardan en este equipo para funcionar sin conexión. El idioma predeterminado es el inglés británico.',
  'settings.spellcheckEnGB': 'Inglés (Reino Unido)',
  'settings.spellcheckEnUS': 'Inglés (Estados Unidos)',
  'settings.spellcheckEs': 'Español (Latinoamérica / Paraguay)',
  'settings.spellcheckDownload': 'Descargar diccionarios',
  'settings.spellcheckOpenFolder': 'Abrir carpeta de diccionarios',
  'settings.spellcheckUrl': 'URL de descarga de diccionarios (opcional)',
  'settings.spellcheckUrlHint':
    'Déjelo en blanco para usar las fuentes incluidas. Para una copia propia, use la URL de una carpeta de la que se puedan obtener en-GB.bdic, en-US.bdic y es-419.bdic.',
  'settings.spellcheckReady': 'Listo',
  'settings.spellcheckMissing': 'No descargado',
  'settings.spellcheckDownloading': 'Descargando diccionarios…',
  'settings.spellcheckDownloadDone': 'Diccionarios guardados en este equipo.',
  'settings.spellcheckDownloadFailed':
    'No se pudo descargar uno o más diccionarios. Copie archivos .bdic en la carpeta de diccionarios o indique una URL propia.',
  'settings.spellcheckHunspellNote':
    'Windows y Linux usan estos archivos Hunspell. En macOS se usa el corrector del sistema (macOS elige el idioma).',
  'firstRun.title': '¿Dónde deben guardarse los proyectos?',
  'firstRun.body':
    'Elija una carpeta base para todos los guiones. Cada proyecto tiene su propia carpeta. Puede cambiarla después en Ajustes.',
  'firstRun.chooseFolder': 'Elegir carpeta…',
  'firstRun.projectName': 'Nombre del proyecto',
  'firstRun.create': 'Crear proyecto',
  'dialog.newProject.hint':
    'Se cierra el proyecto actual y se crea una carpeta nueva con un borrador fechado.',
  'notes.title': 'Notas',
  'notes.empty': 'Aún no hay notas. Escriba [[ Note 1]] en el guion o añada una aquí.',
  'notes.add': 'Añadir nota',
  'index.title': 'Índice',
  'index.search': 'Buscar en el índice…',
  'index.scenes': 'Escenas',
  'index.characters': 'Personajes',
  'index.notes': 'Notas',
  'index.files': 'Archivos',
  'index.empty': 'Nada coincide.',
  'help.title': 'Ayuda',
  'help.search': 'Buscar en la ayuda…',
  'help.empty': 'Ningún artículo coincide.',
  'status.autosaved': 'Autoguardado',
  'welcome.firstRun': 'Elija la carpeta de proyectos y el nombre del primer guion.',
  'dialog.unsaved.title': 'Cambios sin guardar',
  'dialog.unsaved.message':
    'Hay cambios sin guardar. ¿Desea guardarlos antes de continuar?',
  'dialog.unsaved.save': 'Guardar',
  'dialog.unsaved.discard': 'Descartar',
  'dialog.unsaved.cancel': 'Cancelar',
  'dialog.error.title': 'Error',
  'dialog.about.title': 'Acerca de FilmScriptWriter (Beta)',
  'dialog.about.message':
    'FilmScriptWriter es una vista previa BETA de un editor de guiones Fountain (paginación Hollywood, exportación PDF/FDX, vista previa). Puede cambiar; aún no es un producto final.',
  'status.words': 'Palabras',
  'status.pages': 'Páginas',
  'status.ready': 'Listo',
  'status.modified': 'Modificado',
  'status.saved': 'Guardado',
  'status.untitled': 'Sin título',
  'status.font': 'Fuente',
  'status.find': 'Buscar',
  'status.replace': 'Reemplazar',
  'preview.title': 'Vista previa',
  'preview.empty': 'La vista previa paginada del guion aparecerá aquí.',
  'editor.placeholder':
    'Empiece a escribir su guion en formato Fountain…\n\nINT. CAFETERÍA - DÍA\n\nUna mañana tranquila. La LUZ DEL SOL entra por las ventanas.\n\nALICIA\n(sonriendo)\nHola, mundo.',
  'welcome.title': 'Bienvenido',
  'welcome.body':
    'Cree un proyecto nuevo o abra una carpeta / archivo .fountain para comenzar.',
  'common.ok': 'Aceptar',
  'common.cancel': 'Cancelar',
  'common.close': 'Cerrar',
  'update.checking': 'Buscando actualizaciones…',
  'update.available': 'Hay una actualización disponible.',
  'update.none': 'Ya tiene la última versión.',
  'update.error': 'No se pudieron buscar actualizaciones.',
  'settings.syntaxColors': 'Colores de sintaxis',
  'settings.syntaxHint':
    'Los colores solo se aplican al editor. La vista previa permanece en blanco y negro.',
  'settings.preset': 'Preajuste',
  'settings.resetColors': 'Restablecer valores'
}

const fr_FR: Messages = {
  'app.name': 'FilmScriptWriter (Beta)',
  'app.tagline': 'Aperçu bêta — scénarios Fountain',
  'menu.file': 'Fichier',
  'menu.edit': 'Édition',
  'menu.view': 'Affichage',
  'menu.export': 'Exporter',
  'menu.theme': 'Thème',
  'menu.language': 'Langue',
  'menu.settings': 'Réglages',
  'menu.help': 'Aide',
  'menu.file.new': 'Nouveau sans titre',
  'menu.file.newProject': 'Nouveau projet…',
  'menu.file.closeProject': 'Fermer le projet',
  'menu.file.open': 'Ouvrir un fichier…',
  'menu.file.openProject': 'Ouvrir un projet…',
  'menu.file.importDraft': 'Importer comme brouillon actuel…',
  'menu.file.importNotes': 'Importer comme notes…',
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
  'menu.view.preview': 'Basculer l’aperçu',
  'menu.view.syntaxHelp': 'Aide syntaxe Fountain',
  'menu.view.index': 'Index',
  'menu.view.notes': 'Notes',
  'menu.view.syntaxCoach': 'Barre d’aide Fountain',
  'menu.view.split1': 'Un volet',
  'menu.view.split2': 'Deux volets',
  'menu.view.split3': 'Trois volets',
  'menu.view.previewFollow': 'L’aperçu suit l’éditeur',
  'menu.view.typewriter': 'Mode machine à écrire',
  'menu.view.syntax': 'Coloration syntaxique',
  'menu.view.syntaxColors': 'Couleurs de syntaxe…',
  'menu.view.fontIncrease': 'Augmenter la taille de police',
  'menu.view.fontDecrease': 'Diminuer la taille de police',
  'menu.view.fontReset': 'Réinitialiser la taille de police',
  'menu.view.toggleDevTools': 'Outils de développement',
  'menu.view.reload': 'Recharger',
  'menu.export.fountain': 'Exporter en Fountain…',
  'menu.export.fdx': 'Exporter en Final Draft (.fdx)…',
  'menu.export.pdf': 'Exporter en PDF…',
  'menu.theme.light': 'Clair',
  'menu.theme.dark': 'Sombre',
  'menu.theme.system': 'Système',
  'menu.language.en_GB': 'English (UK)',
  'menu.language.es_PY': 'Español (Paraguay)',
  'menu.language.fr_FR': 'Français (France)',
  'menu.help.about': 'À propos',
  'menu.help.guide': 'Aide et instructions…',
  'menu.help.checkUpdates': 'Rechercher les mises à jour…',
  'menu.settings.workspace': 'Projets et enregistrement auto…',
  'menu.settings.spellcheck': 'Correcteur orthographique',
  'menu.edit.addToDictionary': 'Ajouter au dictionnaire',
  'settings.title': 'Réglages',
  'settings.baseFolder': 'Dossier des projets',
  'settings.changeFolder': 'Changer…',
  'settings.autosave': 'Enregistrement automatique',
  'settings.autosaveOff': 'Désactivé',
  'settings.autosaveEvery': 'Toutes les {n} minutes',
  'settings.template': 'Modèle de nouveau projet',
  'settings.templateHint':
    'Ce fichier Fountain est copié dans chaque nouveau projet. Modifiez-le ici ou choisissez le vôtre. Une copie d’usine permet de rétablir l’original.',
  'settings.templateChoose': 'Utiliser mon fichier…',
  'settings.templateSave': 'Enregistrer le modèle',
  'settings.templateRevert': 'Rétablir l’original',
  'settings.templateSelectAll': 'Tout sélectionner',
  'settings.templateUnsaved':
    'Le modèle a des modifications non enregistrées. Fermer Réglages et les abandonner ?',
  'settings.templateSaved': 'Modèle enregistré. Les nouveaux projets l’utiliseront.',
  'settings.templateReverted': 'Modèle restauré à partir de l’original.',
  'settings.spellcheck': 'Correcteur orthographique',
  'settings.spellcheckEnabled': 'Activer le correcteur',
  'settings.spellcheckHint':
    'Les fautes sont soulignées pendant la saisie. Les dictionnaires sont enregistrés sur cet ordinateur pour fonctionner hors ligne. L’anglais britannique est la langue par défaut.',
  'settings.spellcheckEnGB': 'Anglais (Royaume-Uni)',
  'settings.spellcheckEnUS': 'Anglais (États-Unis)',
  'settings.spellcheckEs': 'Espagnol (Amérique latine / Paraguay)',
  'settings.spellcheckDownload': 'Télécharger les dictionnaires',
  'settings.spellcheckOpenFolder': 'Ouvrir le dossier des dictionnaires',
  'settings.spellcheckUrl': 'URL de téléchargement des dictionnaires (facultatif)',
  'settings.spellcheckUrlHint':
    'Laissez vide pour utiliser les sources intégrées. Pour une copie auto-hébergée, indiquez l’URL d’un dossier d’où l’application peut récupérer en-GB.bdic, en-US.bdic et es-419.bdic.',
  'settings.spellcheckReady': 'Prêt',
  'settings.spellcheckMissing': 'Non téléchargé',
  'settings.spellcheckDownloading': 'Téléchargement des dictionnaires…',
  'settings.spellcheckDownloadDone': 'Dictionnaires enregistrés sur cet ordinateur.',
  'settings.spellcheckDownloadFailed':
    'Impossible de télécharger un ou plusieurs dictionnaires. Copiez des fichiers .bdic dans le dossier, ou indiquez une URL auto-hébergée.',
  'settings.spellcheckHunspellNote':
    'Windows et Linux utilisent ces fichiers Hunspell. macOS utilise le correcteur du système (macOS choisit la langue).',
  'firstRun.title': 'Où doivent vivre vos projets ?',
  'firstRun.body':
    'Choisissez un dossier de base pour chaque scénario. Chaque projet a son propre dossier. Vous pourrez le changer dans Réglages.',
  'firstRun.chooseFolder': 'Choisir un dossier…',
  'firstRun.projectName': 'Nom du projet',
  'firstRun.create': 'Créer le projet',
  'dialog.newProject.hint':
    'Ferme le projet actuel et crée un dossier avec un brouillon daté.',
  'notes.title': 'Notes',
  'notes.empty': 'Pas encore de notes. Tapez [[ Note 1]] dans le script ou ajoutez-en ici.',
  'notes.add': 'Ajouter une note',
  'index.title': 'Index',
  'index.search': 'Rechercher dans l’index…',
  'index.scenes': 'Scènes',
  'index.characters': 'Personnages',
  'index.notes': 'Notes',
  'index.files': 'Fichiers',
  'index.empty': 'Aucun résultat.',
  'help.title': 'Aide',
  'help.search': 'Rechercher dans l’aide…',
  'help.empty': 'Aucun article ne correspond.',
  'status.autosaved': 'Enregistré automatiquement',
  'welcome.firstRun': 'Choisissez le dossier des projets, puis le nom du premier scénario.',
  'dialog.unsaved.title': 'Modifications non enregistrées',
  'dialog.unsaved.message':
    'Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de continuer ?',
  'dialog.unsaved.save': 'Enregistrer',
  'dialog.unsaved.discard': 'Abandonner',
  'dialog.unsaved.cancel': 'Annuler',
  'dialog.error.title': 'Erreur',
  'dialog.about.title': 'À propos de FilmScriptWriter (Beta)',
  'dialog.about.message':
    'FilmScriptWriter est un aperçu BÊTA d’un éditeur de scénarios Fountain (pagination Hollywood, export PDF/FDX, aperçu). Fonctions susceptibles de changer ; pas encore un produit fini.',
  'status.words': 'Mots',
  'status.pages': 'Pages',
  'status.ready': 'Prêt',
  'status.modified': 'Modifié',
  'status.saved': 'Enregistré',
  'status.untitled': 'Sans titre',
  'status.font': 'Police',
  'status.find': 'Rechercher',
  'status.replace': 'Remplacer',
  'preview.title': 'Aperçu',
  'preview.empty': 'L’aperçu paginé de votre scénario apparaîtra ici.',
  'editor.placeholder':
    'Commencez à écrire votre scénario au format Fountain…\n\nINT. CAFÉ - JOUR\n\nUn matin calme. La LUMIÈRE DU SOLEIL entre par les fenêtres.\n\nALICE\n(souriante)\nBonjour le monde.',
  'welcome.title': 'Bienvenue',
  'welcome.body':
    'Créez un nouveau projet, ou ouvrez un dossier / fichier .fountain pour commencer.',
  'common.ok': 'OK',
  'common.cancel': 'Annuler',
  'common.close': 'Fermer',
  'update.checking': 'Recherche de mises à jour…',
  'update.available': 'Une mise à jour est disponible.',
  'update.none': 'Vous utilisez la dernière version.',
  'update.error': 'Impossible de rechercher les mises à jour.',
  'settings.syntaxColors': 'Couleurs de syntaxe',
  'settings.syntaxHint':
    'Les couleurs s’appliquent uniquement à l’éditeur. L’aperçu reste en noir et blanc.',
  'settings.preset': 'Préréglage',
  'settings.resetColors': 'Réinitialiser'
}

export const LOCALES: Record<LocaleCode, Messages> = {
  en_GB,
  es_PY,
  fr_FR
}

/**
 * Translate a key for the given locale, falling back to en_GB then the key.
 */
export function t(locale: LocaleCode, key: MessageKey): string {
  return LOCALES[locale]?.[key] ?? LOCALES.en_GB[key] ?? key
}
