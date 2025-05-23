const es = {
  translation: {
    // Common
    'app.title': 'Gestor de Tareas de Formación',
    'app.loading': 'Cargando...',
    'app.error': 'Ha ocurrido un error',
    'app.required': 'Obligatorio',
    'app.save': 'Guardar',
    'app.cancel': 'Cancelar',
    'app.delete': 'Eliminar',
    'app.edit': 'Editar',
    'app.view': 'Ver',
    'app.back': 'Volver',
    'app.submit': 'Enviar',
    'app.search': 'Buscar',
    'app.filter': 'Filtrar',
    'app.reset': 'Restablecer',
    'app.close': 'Cerrar',
    'app.confirm': 'Confirmar',
    'app.yes': 'Sí',
    'app.no': 'No',
    'app.actions': 'Acciones',
    'app.all': 'Todos',
    'app.details': 'Detalles',
    
    // Navigation
    'nav.home': 'Inicio',
    'nav.editions': 'Ediciones',
    'nav.tasks': 'Tareas',
    'nav.trainers': 'Formadores',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',
    'nav.users': 'Usuarios',
    'nav.account': 'Cuenta',
    'nav.notifications': 'Notificaciones',
    'nav.logout': 'Cerrar Sesión',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.register': 'Registrarse',
    'auth.username': 'Nombre de Usuario',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidó su Contraseña?',
    'auth.rememberMe': 'Recordarme',
    'auth.loginSuccess': 'Inicio de sesión exitoso',
    'auth.loginError': 'Error al iniciar sesión',
    'auth.logoutSuccess': 'Sesión cerrada exitosamente',
    'auth.passwordMismatch': 'Las contraseñas no coinciden',
    'auth.unauthorized': 'No autorizado',
    'auth.sessionExpired': 'Sesión expirada, inicie sesión nuevamente',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido, {{name}}',
    'dashboard.overdueTasks': 'Tareas Vencidas',
    'dashboard.upcomingTasks': 'Próximas Tareas',
    'dashboard.recentEditions': 'Ediciones Recientes',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.noOverdueTasks': 'No hay tareas vencidas',
    'dashboard.ongoingTrainingSessions': 'Sesiones de Formación en Curso',
    'dashboard.noUpcomingTasks': 'No hay próximas tareas',
    'dashboard.viewAll': 'Ver Todo',
    'dashboard.tasksThisWeek': 'Tareas de Esta Semana',
    'dashboard.completedThisWeek': 'Completadas Esta Semana',
    'dashboard.currentWeeks': 'Semanas Actuales',
    'dashboard.activeEditions': 'Ediciones Activas',
    'dashboard.currentlyRunningEditions': 'Ediciones de formación en ejecución',
    'dashboard.taskManagement': 'Gestión de Tareas',
    
    // Editions
    'editions.title': 'Ediciones',
    'editions.create': 'Crear Edición',
    'editions.edit': 'Editar Edición',
    'editions.view': 'Ver Edición',
    'editions.code': 'Código',
    'editions.trainingType': 'Tipo de Formación',
    'editions.startDate': 'Fecha de Inicio',
    'editions.tasksStartDate': 'Fecha de Inicio de Tareas',
    'editions.status': 'Estado',
    'editions.currentWeek': 'Semana Actual',
    'editions.active': 'Activa',
    'editions.archived': 'Archivada',
    'editions.description': 'Descripción',
    'editions.location': 'Ubicación',
    'editions.deleteConfirm': '¿Está seguro de que desea eliminar esta edición?',
    'editions.createSuccess': 'Edición creada exitosamente',
    'editions.updateSuccess': 'Edición actualizada exitosamente',
    'editions.deleteSuccess': 'Edición eliminada exitosamente',
    'editions.error': 'Error al procesar la edición',
    
    // Tasks
    'tasks.title': 'Tareas',
    'tasks.create': 'Crear Tarea',
    'tasks.edit': 'Editar Tarea',
    'tasks.view': 'Ver Tarea',
    'tasks.name': 'Nombre',
    'tasks.week': 'Semana',
    'tasks.trainingType': 'Tipo de Formación',
    'tasks.editionId': 'Edición',
    'tasks.taskCode': 'Código de Tarea',
    'tasks.duration': 'Duración',
    'tasks.status': 'Estado',
    'tasks.assignedTo': 'Asignado a',
    'tasks.owner': 'Propietario',
    'tasks.dueDate': 'Fecha de Vencimiento',
    'tasks.completionDate': 'Fecha de Finalización',
    'tasks.notes': 'Notas',
    'tasks.deleteConfirm': '¿Está seguro de que desea eliminar esta tarea?',
    'tasks.createSuccess': 'Tarea creada exitosamente',
    'tasks.updateSuccess': 'Tarea actualizada exitosamente',
    'tasks.deleteSuccess': 'Tarea eliminada exitosamente',
    'tasks.error': 'Error al procesar la tarea',
    'tasks.backToList': 'Volver a la Lista de Tareas',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.dashboard': 'Panel de Control',
    'settings.tasks': 'Tareas',
    'settings.account': 'Cuenta',
    'settings.notifications': 'Notificaciones',
    'settings.security': 'Seguridad',
    'settings.dashboardSettings': 'Configuración del Panel',
    'settings.taskSettings': 'Configuración de Tareas',
    'settings.accountSettings': 'Configuración de la Cuenta',
    'settings.notificationSettings': 'Configuración de Notificaciones',
    'settings.securitySettings': 'Configuración de Seguridad',
    'settings.darkTheme': 'Tema Oscuro',
    'settings.language': 'Idioma',
    'settings.timezone': 'Zona Horaria',
    'settings.saveSuccess': 'Configuración guardada exitosamente',
    'settings.templateManagement': 'Gestión de Plantillas',
    'settings.downloadTemplate': 'Descargar Plantilla',
    'settings.uploadTemplate': 'Subir Plantilla',
    'settings.updateTerminology': 'Actualizar Terminología',
    'settings.dataManagement': 'Gestión de Datos',
    'settings.exportData': 'Exportar Datos',
    'settings.importData': 'Importar Datos',
    'settings.systemBackup': 'Copia de Seguridad del Sistema',

    // Statuses
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.pending': 'Pendiente',
    'status.completed': 'Completado',
    'status.canceled': 'Cancelado',
    'status.notStarted': 'No Iniciado',
    'status.inProgress': 'En Progreso',
    'status.done': 'Terminado',
    'status.upcoming': 'Próximo',
    'status.finished': 'Finalizado',
    
    // Training Types
    'trainingType.glr': 'Ruta de Aprendizaje Guiada',
    'trainingType.slr': 'Ruta de Autoaprendizaje',
    'trainingType.all': 'Todos los Tipos',
  }
};

export default es;