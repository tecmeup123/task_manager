# Changelog

All notable changes to the Training Session Management Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Progressive Web App (PWA) capabilities with offline support
- Installation prompts for mobile and desktop devices
- Welcome screen for PWA users with feature highlights
- Personalized PWA experience based on user role
- Mobile-optimized card-based UI for Users section

### Fixed
- Critical issue with training type consistency across the application
- Removed all instances of the deprecated "assignedTo" field
- Fixed syntax errors in server/storage.ts, particularly around ternary operators
- Corrected inconsistent timestamp field naming across the application
- Improved error handling for duplicate edition codes

## [1.2.0] - 2025-03-15

### Added
- Comprehensive audit logging system for all entity changes
- Task history viewer to track all modifications
- User login activity tracking
- Session timeout configuration
- "Remember Me" functionality for persistent login
- Account activity logging
- Security settings page

### Changed
- Redesigned task status flow to prevent reverting completed tasks
- Enhanced dashboard with collapsible sections for overdue and upcoming tasks
- Improved performance of notification system
- Reorganized settings page with tabbed navigation

### Fixed
- Fixed issue with task week sections not maintaining expanded state
- Resolved scroll position reset when updating task status
- Corrected pagination in activity logs

## [1.1.0] - 2025-02-01

### Added
- Resource attachment system for tasks
- @mentions functionality in task comments
- Notification system for mentions and task assignments
- Full internationalization with support for six languages
- Language persistence using localStorage
- Task commenting system

### Changed
- Enhanced edition status badges with color coding
- Improved task filtering capabilities
- Updated dashboard to show only upcoming editions with future start dates
- Refined user interface for better mobile experience

### Fixed
- Fixed issue with task due date calculations not accounting for weekends
- Resolved permission issues with non-admin users
- Corrected edition duplication functionality

## [1.0.0] - 2025-01-10

### Added
- Initial release of the Training Session Management Application
- Edition management with YYMM-[A/B] format
- Task management system with week-based organization (-5 to 8)
- Template-based task creation
- Role-based user permissions (Admin, Editor, Viewer)
- Trainer management
- Edition duplication
- Task ownership tracking
- Dashboard with overdue and upcoming tasks
- User management with approval workflow
- First-time login password change enforcement

### Security
- Password hashing with scrypt
- Session-based authentication
- Role-based access control
- Protection against common web vulnerabilities