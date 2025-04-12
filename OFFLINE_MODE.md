
# Demo Retail Management System - Offline Mode

This document provides information about the offline capabilities of the Demo Retail Management System.

## Offline Functionality

The Demo Retail Management System is designed to work completely offline, making it suitable for retail environments with unreliable or no internet connectivity.

### Key Features in Offline Mode:

1. **Local Data Storage**: All data is stored in the browser's localStorage, allowing the application to function without an internet connection.

2. **Printing Support**: Full support for printing receipts and reports directly from the browser.

3. **Data Backup & Export**: You can manually backup your data to your local machine and restore it when needed.

4. **No Remote Sync Required**: The system operates completely independently without needing to sync with a remote server.

## Important Notes

### Data Persistence

- All data is stored in your browser's localStorage
- Data will persist between sessions as long as you use the same browser and don't clear browser data
- Regular backups are recommended

### Data Limitations

- localStorage has a size limit (typically 5-10MB depending on the browser)
- For larger inventories (1000+ products), consider implementing an IndexedDB solution

### Printing

- The system uses the browser's built-in print functionality
- For best results, configure your printer settings correctly in your browser
- Test printing on your specific hardware before full deployment

## Alternative Database Options

If you require more robust data storage while maintaining offline capabilities, consider:

1. **IndexedDB**: A more powerful browser-based database with larger storage limits.

2. **SQLite with Electron**: For a desktop application approach.

3. **Local Server**: Running a small local server like SQLite, PostgreSQL, or MySQL on the same machine.

4. **Hybrid Approach**: Using offline storage with occasional online synchronization when internet is available.

## Supabase for Online Mode

If you want to add online capabilities in the future, Supabase could be integrated as follows:

1. Keep the offline functionality for primary operation
2. Add optional Supabase sync when internet connection is available
3. Implement conflict resolution strategies for data synchronized between offline and online modes

## Support

For assistance with the offline functionality of this system, please contact the support team.
