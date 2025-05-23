const en = {
  translation: {
    // Common
    'app.title': 'Training Task Manager',
    'app.loading': 'Loading...',
    'app.error': 'An error occurred',
    'app.required': 'Required',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.view': 'View',
    'app.back': 'Back',
    'app.submit': 'Submit',
    'app.search': 'Search',
    'app.filter': 'Filter',
    'app.reset': 'Reset',
    'app.close': 'Close',
    'app.confirm': 'Confirm',
    'app.yes': 'Yes',
    'app.no': 'No',
    'app.actions': 'Actions',
    'app.all': 'All',
    'app.details': 'Details',
    'previous': 'Previous',
    'next': 'Next',
    'skip': 'Skip Onboarding',
    'finish': 'Finish',
    
    // Navigation
    'nav.home': 'Home',
    'nav.editions': 'Editions',
    'nav.tasks': 'Tasks',
    'nav.trainers': 'Trainers',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.users': 'Users',
    'nav.account': 'Account',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.changePassword': 'Change Password',
    'auth.loginSuccess': 'Login successful',
    'auth.loginError': 'Login failed',
    'auth.logoutSuccess': 'Logout successful',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.unauthorized': 'Unauthorized',
    'auth.sessionExpired': 'Session expired, please login again',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome, {{name}}',
    'dashboard.overdueTasks': 'Overdue Tasks',
    'dashboard.upcomingTasks': 'Upcoming Tasks',
    'dashboard.recentEditions': 'Recent Editions',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.noOverdueTasks': 'No overdue tasks',
    'dashboard.ongoingTrainingSessions': 'Ongoing Training Sessions',
    'dashboard.noUpcomingTasks': 'No upcoming tasks',
    'dashboard.viewAll': 'View All',
    'dashboard.tasksThisWeek': 'Tasks This Week',
    'dashboard.completedThisWeek': 'Completed This Week',
    'dashboard.currentWeeks': 'Current Weeks',
    'dashboard.activeEditions': 'Active Editions',
    'dashboard.currentlyRunningEditions': 'Currently running training editions',
    'dashboard.taskManagement': 'Task Management',
    'dashboard.noActiveEditions': 'No active editions',
    'dashboard.noEditionsAvailable': 'No editions available',
    'dashboard.createEdition': 'Create Edition',
    'dashboard.hideFilters': 'Hide Filters',
    'dashboard.showFilters': 'Show Filters',
    'dashboard.resetFilters': 'Reset Filters',
    'dashboard.searchTasks': 'Search Tasks',
    'dashboard.searchPlaceholder': 'Search by name, owner, status...',
    'dashboard.filterByStatus': 'Filter by status',
    'dashboard.filterByWeek': 'Filter by week',
    'dashboard.filterByEdition': 'Filter by edition',
    'dashboard.filterByOwner': 'Filter by owner',
    'dashboard.allStatuses': 'All Statuses',
    'dashboard.allWeeks': 'All Weeks',
    'dashboard.allEditions': 'All Editions',
    'dashboard.allOwners': 'All Owners',
    'dashboard.tasksDueSoon': 'Tasks that are past their due date',
    'dashboard.tasksInNext7Days': 'Tasks due in the next 7 days',
    'dashboard.noUpcomingTasksDue': 'No upcoming tasks due soon',
    'dashboard.viewAllOverdueTasks': 'View all {{count}} overdue tasks',
    'dashboard.viewAllUpcomingTasks': 'View all {{count}} upcoming tasks',
    
    // Editions
    'editions.title': 'Editions',
    'editions.create': 'Create Edition',
    'editions.edit': 'Edit Edition',
    'editions.view': 'View Edition',
    'editions.code': 'Code',
    'editions.trainingType': 'Training Type',
    'editions.startDate': 'Start Date',
    'editions.tasksStartDate': 'Tasks Start Date',
    'editions.status': 'Status',
    'editions.currentWeek': 'Current Week',
    'editions.active': 'Active',
    'editions.archived': 'Archived',
    'editions.description': 'Description',
    'editions.location': 'Location',
    'editions.deleteConfirm': 'Are you sure you want to delete this edition?',
    'editions.createSuccess': 'Edition created successfully',
    'editions.updateSuccess': 'Edition updated successfully',
    'editions.deleteSuccess': 'Edition deleted successfully',
    'editions.error': 'Error processing edition',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.create': 'Create Task',
    'tasks.edit': 'Edit Task',
    'tasks.view': 'View Task',
    'tasks.details': 'Task Details',
    'tasks.name': 'Name',
    'tasks.description': 'Description',
    'tasks.week': 'Week',
    'tasks.trainingType': 'Training Type',
    'tasks.editionId': 'Edition',
    'tasks.taskCode': 'Task Code',
    'tasks.code': 'Task Code',
    'tasks.duration': 'Duration',
    'tasks.durationPlaceholder': 'e.g. 0:30:00',
    'tasks.pickDate': 'Pick a date',
    'tasks.selectWeek': 'Select a week',
    'tasks.selectTrainingType': 'Select training type',
    'tasks.selectOwner': 'Select owner',
    'tasks.selectAssignment': 'Select assignment',
    'tasks.selectStatus': 'Select status',
    'tasks.assignedToRole': 'Assigned to Role',
    'tasks.assignToUser': 'Assign to User',
    'tasks.assignToSpecificUser': 'Assign to specific user',
    'tasks.userAssignmentNotification': 'The user will receive a notification when assigned',
    'tasks.addNotesPlaceholder': 'Add notes about this task...',
    'tasks.activityHistory': 'Activity History',
    'tasks.by': 'By',
    'tasks.inflexible': 'Inflexible (fixed date)',
    'tasks.due': 'Due',
    'tasks.noDueDate': 'No due date',
    'tasks.update': 'Update Task',
    'tasks.status': 'Status',
    'tasks.assignedTo': 'Assigned To',
    'tasks.owner': 'Owner',
    'tasks.dueDate': 'Due Date',
    'tasks.completionDate': 'Completion Date',
    'tasks.notes': 'Notes',
    'tasks.deleteConfirm': 'Are you sure you want to delete this task?',
    'tasks.createSuccess': 'Task created successfully',
    'tasks.updateSuccess': 'Task updated successfully',
    'tasks.deleteSuccess': 'Task deleted successfully',
    'tasks.error': 'Error processing task',
    'tasks.backToList': 'Back to Task List',
    'tasks.updateSuccessDescription': 'The task was updated successfully',
    'tasks.updateErrorDescription': 'There was an error updating the task',
    'tasks.tabDetails': 'Details',
    'tasks.tabComments': 'Comments',
    'tasks.tabResources': 'Resources',
    'tasks.comments': 'Comments',
    'tasks.resources': 'Resources',
    'tasks.noComments': 'No comments yet',
    'tasks.noResources': 'No resources available',
    'tasks.selectAssignee': 'Select assignee',
    'tasks.noAssignee': 'No assignee',
    'tasks.notesPlaceholder': 'Add notes about this task...',
    'tasks.statusNotStarted': 'Not Started',
    'tasks.statusInProgress': 'In Progress',
    'tasks.statusDone': 'Done',
    'tasks.statusBlocked': 'Blocked',
    'tasks.addComment': 'Add Comment',
    'tasks.commentPlaceholder': 'Write your comment here...',
    'tasks.commentAdded': 'Comment added',
    'tasks.commentAddedDescription': 'Your comment has been added successfully',
    'tasks.commentError': 'Error adding comment',
    'tasks.commentErrorDescription': 'There was an error adding your comment',
    'tasks.addResource': 'Add Resource',
    'tasks.resourceName': 'Resource Name',
    'tasks.resourceNamePlaceholder': 'Enter resource name',
    'tasks.resourceUrl': 'Resource URL',
    'tasks.resourceUrlPlaceholder': 'Enter resource URL',
    'tasks.resourceType': 'Resource Type',
    'tasks.resourceTypeLink': 'Link',
    'tasks.resourceTypeDocument': 'Document',
    'tasks.resourceTypeVideo': 'Video',
    'tasks.resourceTypeImage': 'Image',
    'tasks.resourceTypeOther': 'Other',
    'tasks.resourceAdded': 'Resource added',
    'tasks.resourceAddedDescription': 'The resource has been added successfully',
    'tasks.resourceError': 'Error adding resource',
    'tasks.resourceErrorDescription': 'There was an error adding the resource',
    'tasks.resourceDeleted': 'Resource deleted',
    'tasks.resourceDeletedDescription': 'The resource has been deleted successfully',
    'tasks.deleteError': 'Error deleting',
    'tasks.deleteErrorDescription': 'There was an error deleting the item',
    'tasks.tabHistory': 'History',
    'tasks.history': 'Task History',
    'tasks.noHistory': 'No history available for this task',
    'tasks.changedFields': 'Changed fields',
    'tasks.action.create': 'Created task',
    'tasks.action.update': 'Updated task',
    'tasks.action.delete': 'Deleted task',
    
    // Trainers
    'trainers.title': 'Trainers',
    'trainers.create': 'Create Trainer',
    'trainers.edit': 'Edit Trainer',
    'trainers.view': 'View Trainer',
    'trainers.name': 'Name',
    'trainers.email': 'Email',
    'trainers.role': 'Role',
    'trainers.department': 'Department',
    'trainers.status': 'Status',
    'trainers.deleteConfirm': 'Are you sure you want to delete this trainer?',
    'trainers.createSuccess': 'Trainer created successfully',
    'trainers.updateSuccess': 'Trainer updated successfully',
    'trainers.deleteSuccess': 'Trainer deleted successfully',
    'trainers.error': 'Error processing trainer',
    
    // Settings
    'settings.title': 'Settings',
    'settings.dashboard': 'Dashboard',
    'settings.tasks': 'Tasks',
    'settings.account': 'Account',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.accountDescription': 'Manage your account details and preferences',
    'settings.notificationDescription': 'Configure how and when you receive notifications',
    'settings.securityDescription': 'Manage your password and security preferences',
    'settings.dataDescription': 'Manage system data and backups',
    
    // Account Tab
    'settings.username': 'Username',
    'settings.usernameCannotBeChanged': 'Username cannot be changed',
    'settings.fullName': 'Full Name',
    'settings.emailAddress': 'Email Address',
    'settings.role': 'Role',
    'settings.contactAdmin': 'Contact an administrator to change your role',
    'settings.accountPreferences': 'Account Preferences',
    'settings.interfaceLanguage': 'Interface Language',
    'settings.timeZone': 'Time Zone',
    'settings.selectLanguage': 'Select language',
    'settings.selectTimeZone': 'Select time zone',
    
    // Notifications Tab
    'settings.bellIconNotifications': 'Bell Icon Notifications',
    'settings.allNotificationsAppear': 'All notifications will appear in the bell icon at the top right of the application',
    'settings.taskAssignments': 'Task Assignments',
    'settings.showNotificationsWhenAssigned': 'Show notifications when you are assigned a task',
    'settings.taskUpdates': 'Task Updates',
    'settings.showNotificationsWhenUpdated': 'Show notifications when tasks you own are updated',
    'settings.approachingDueDates': 'Approaching Due Dates',
    'settings.showRemindersForTasks': 'Show reminders for tasks with approaching due dates',
    'settings.newEditionCreated': 'New Edition Created',
    'settings.showNotificationsNewEdition': 'Show notifications when a new training edition is created',
    'settings.weeklySummary': 'Weekly Summary',
    'settings.showWeeklySummary': 'Show a weekly summary of your tasks and upcoming deadlines',
    'settings.notificationAppearance': 'Notification Appearance',
    'settings.playSound': 'Play sound when new notifications arrive',
    'settings.showPopup': 'Show popup notifications',
    'settings.showBadge': 'Show notification count badge on bell icon',
    'settings.notificationFrequency': 'Notification Frequency',
    'settings.dueDateReminder': 'Due Date Reminder',
    'settings.selectReminderTime': 'Select reminder time',
    
    // Security Tab
    'settings.passwordManagement': 'Password Management',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmNewPassword': 'Confirm New Password',
    'settings.passwordRequirements': 'Password must be at least 8 characters and include letters, numbers, and special characters',
    'settings.loginSecurity': 'Login Security',
    'settings.sessionTimeout': 'Session Timeout',
    'settings.autoLogout': 'Automatically log out after period of inactivity',
    'settings.selectTimeout': 'Select timeout',
    'settings.rememberMe': 'Remember Me',
    'settings.stayLoggedIn': 'Stay logged in on this device',
    'settings.accountActivity': 'Account Activity',
    'settings.dateTime': 'Date & Time',
    'settings.ipAddress': 'IP Address',
    'settings.device': 'Device',
    'settings.viewActivityLog': 'View Full Activity Log',
    'settings.dangerZone': 'Danger Zone',
    'settings.deleteWarning': 'Once you delete your account, there is no going back',
    'settings.deleteAccount': 'Delete Account',
    
    // Data Tab
    'settings.databaseOperations': 'Database Operations',
    'settings.createSystemBackup': 'Create System Backup',
    'settings.selectBackupFile': 'Select Backup File',
    'settings.selectedFile': 'Selected',
    'settings.importData': 'Import',
    'settings.exportSystemData': 'Export All System Data',
    'settings.adminPrivilegesRequired': 'Administrator privileges are required to access system data management features',
    'settings.templateManagement': 'Template Management',
    'settings.selectTemplateDownload': 'Select Template to Download',
    'settings.downloadDefaultTemplate': 'Download Default Template',
    'settings.tasksCount': 'tasks',
    'settings.templateIncludes': 'Templates include tasks for all weeks from Week -5 to Week 8',
    'settings.uploadTemplateBtn': 'Upload Template',
    'settings.uploadTemplateDescription': 'Upload a JSON or CSV file with task templates. This will update your template tasks',
    'settings.updateTerminologyTitle': 'Update Terminology in Existing Tasks',
    'settings.updating': 'Updating...',
    'settings.replaceEmailReferences': 'Replace Email/Mailing References in Tasks',
    'settings.terminologyUpdateDescription': 'This will update all tasks in the database to use new terminology (e.g., "Create participant list" instead of "Create mailing list")',
    'settings.adminEditorPrivilegesRequired': 'Admin or editor privileges are required to access template management features',
    'settings.dashboardSettings': 'Dashboard Settings',
    'settings.taskSettings': 'Task Settings',
    'settings.accountSettings': 'Account Settings',
    'settings.notificationSettings': 'Notification Settings',
    'notifications.title': 'Notifications',
    'notifications.markAllAsRead': 'Mark all as read',
    'notifications.markAsRead': 'Mark as read',
    'notifications.goToTask': 'Go to task',
    'notifications.viewEdition': 'View edition',
    'notifications.loading': 'Loading notifications...',
    'notifications.assigned': 'Assigned',
    'notifications.updated': 'Updated',
    'notifications.dueSoon': 'Due Soon',
    'notifications.createTest': 'Create Test Notification',
    'notifications.viewAll': 'View all notifications',
    'notifications.empty': 'No new notifications',
    'notifications.new': 'New',
    'notifications.earlier': 'Earlier',
    'editions.none_found': 'No editions found',
    'settings.securitySettings': 'Security Settings',
    'settings.darkTheme': 'Dark Theme',
    'settings.language': 'Language',
    'settings.timezone': 'Time Zone',
    'settings.saveSuccess': 'Settings saved successfully',
    'settings.templateManagementTitle': 'Template Management',
    'settings.downloadTemplateBtn': 'Download Template',
    'settings.dataManagement': 'Data Management',
    'settings.exportDataBtn': 'Export Data',
    'settings.importDataBtn': 'Import Data',
    'settings.systemBackupBtn': 'System Backup',
    
    // Users
    'users.title': 'Users',
    'users.create': 'Create User',
    'users.edit': 'Edit User',
    'users.view': 'View User',
    'users.username': 'Username',
    'users.fullName': 'Full Name',
    'users.email': 'Email',
    'users.role': 'Role',
    'users.status': 'Status',
    'users.password': 'Password',
    'users.confirmPassword': 'Confirm Password',
    'users.forcePasswordChange': 'Force Password Change',
    'users.approved': 'Approved',
    'users.createdAt': 'Created At',
    'users.lastLogin': 'Last Login',
    'users.deleteConfirm': 'Are you sure you want to delete this user?',
    'users.createSuccess': 'User created successfully',
    'users.updateSuccess': 'User updated successfully',
    'users.deleteSuccess': 'User deleted successfully',
    'users.error': 'Error processing user',
    
    // Statuses
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.canceled': 'Canceled',
    'status.notStarted': 'Not Started',
    'status.inProgress': 'In Progress',
    'status.done': 'Done',
    'status.upcoming': 'Upcoming',
    'status.finished': 'Finished',
    
    // Common Elements
    'common.none': 'None',
    'common.loadingUsers': 'Loading users...',
    'common.noUsersAvailable': 'No users available',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saving': 'Saving',
    'common.view': 'View',
    'common.unknownUser': 'Unknown User',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Training Types
    'trainingType.glr': 'Guided Learning Route',
    'trainingType.slr': 'Self Learning Route',
    'trainingType.all': 'All Types',
    
    // Roles
    'role.admin': 'Administrator',
    'role.editor': 'Editor',
    'role.viewer': 'Viewer',
    'role.trainer': 'Trainer',
    
    // Menu Items
    'menu_dashboard': 'Dashboard',
    'menu_home': 'Home',
    'menu_tasks': 'Tasks',
    'menu_editions': 'Editions',
    'menu_settings': 'Settings',
    'menu_users': 'Users',
    'menu_navigation': 'Navigation',
    'menu_current_editions': 'Current Editions',
    'app.footer': 'Training Team Task Tracker made with ♥️',
    
    // Onboarding
    'welcome_to_training_app': 'Welcome to Training Task Manager!',
    'onboarding_welcome_description': 'Get ready to manage your training sessions more efficiently. Let\'s take a quick tour of the key features to help you get started.',
    
    'dashboard_overview': 'Dashboard Overview',
    'dashboard_description': 'Your dashboard gives you a quick snapshot of your training status with overdue and upcoming tasks.',
    'key_features': 'Key Features',
    'dashboard_feature_1': 'See overdue tasks that need attention',
    'dashboard_feature_2': 'Preview upcoming tasks to plan your work',
    'dashboard_feature_3': 'Get a snapshot of active editions',
    'dashboard_tip': 'Tip: Check your dashboard daily to stay on top of time-sensitive training tasks!',
    
    'tasks_management': 'Tasks Management',
    'tasks_description': 'Manage all training tasks efficiently with our week-based organization system.',
    'task_statuses': 'Task Statuses',
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'done': 'Done',
    'task_types': 'Training Types',
    'guided_learning_route': 'Guided Learning Route',
    'self_learning_route': 'Self Learning Route',
    'tasks_pro_tip': 'Pro Tip: Focus on tasks in the current week first, then tackle upcoming ones.',
    
    'editions_management': 'Editions Management',
    'editions_description': 'Training editions follow the YYMM-[A/B] format and can be easily created, managed and duplicated.',
    'edition_format': 'Edition Format',
    'edition_format_description': 'We use a standardized format for all training editions:',
    'for_customers': 'For Customers',
    'for_partners': 'For Partners',
    'edition_cloning': 'Edition Cloning',
    'edition_cloning_description': 'You can quickly duplicate any edition to create a new one with all its tasks.',
    
    'customize_your_experience': 'Customize Your Experience',
    'settings_description': 'Personalize your training management experience with these settings.',
    'language': 'Language',
    'language_setting_description': 'Change the application language to suit your preference',
    'profile': 'Profile',
    'profile_setting_description': 'Update your personal information and avatar',
    'settings_security_tip': 'Remember to change your password regularly for better security!',
    
    'youre_all_set': 'You\'re All Set',
    'onboarding_complete_description': 'You\'ve completed the onboarding tour and are ready to start managing your training sessions like a pro!',
    'whats_next': 'What\'s Next?',
    'onboarding_next_steps': 'Start by creating a new edition or explore tasks in existing editions.',
    'onboarding_restart_hint': 'You can restart this tour anytime from the help menu if needed.'
  }
};

export default en;