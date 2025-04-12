
// This file provides a bridge between the web app and Electron

export function setupElectronBridge() {
  // Check if we're running in Electron
  const isElectron = window.navigator.userAgent.includes('Electron');
  
  if (isElectron) {
    // Get electron APIs
    const { ipcRenderer } = window.require('electron');
    
    // Add export/import functions to window object for menu access
    window.exportData = async () => {
      try {
        // Collect all data from localStorage
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              // Try to parse JSON data
              data[key] = JSON.parse(localStorage.getItem(key) || "null");
            } catch (e) {
              // If not JSON, store as-is
              data[key] = localStorage.getItem(key);
            }
          }
        }
        
        const result = await ipcRenderer.invoke('export-data', data);
        
        if (result.success) {
          console.log('Data exported successfully to:', result.filePath);
          alert(`Data exported successfully to: ${result.filePath}`);
        } else {
          console.error('Failed to export data:', result.error);
          alert(`Failed to export data: ${result.error}`);
        }
      } catch (error) {
        console.error('Error exporting data:', error);
        alert(`Error exporting data: ${error.message}`);
      }
    };
    
    window.importData = async () => {
      try {
        const result = await ipcRenderer.invoke('import-data');
        
        if (result.success) {
          // Clear existing localStorage
          localStorage.clear();
          
          // Import the data
          const data = result.data;
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, typeof data[key] === 'object' ? 
              JSON.stringify(data[key]) : 
              data[key]
            );
          });
          
          console.log('Data imported successfully');
          alert('Data imported successfully. Please refresh the page to see the changes.');
          
          // Reload the page to apply changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to import data:', result.error);
          alert(`Failed to import data: ${result.error}`);
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert(`Error importing data: ${error.message}`);
      }
    };
    
    // Add save file function
    window.saveFile = async (content, fileName, fileType) => {
      try {
        const result = await ipcRenderer.invoke('save-file', { content, fileName, fileType });
        return result;
      } catch (error) {
        console.error('Error saving file:', error);
        throw error;
      }
    };
    
    console.log('Electron bridge initialized');
  } else {
    // Fallbacks for web version
    window.exportData = () => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || "null");
          } catch (e) {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'retail-data-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    };
    
    window.importData = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            localStorage.clear();
            Object.keys(data).forEach(key => {
              localStorage.setItem(key, typeof data[key] === 'object' ? 
                JSON.stringify(data[key]) : 
                data[key]
              );
            });
            
            alert('Data imported successfully. Please refresh the page to see the changes.');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            console.error('Error parsing import file:', error);
            alert(`Error importing data: Invalid file format`);
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    };
    
    window.saveFile = async (content, fileName, fileType) => {
      const blob = new Blob([content], { type: `application/${fileType}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    };
    
    console.log('Web fallbacks initialized');
  }
}

// Add TypeScript interface
declare global {
  interface Window {
    exportData: () => void;
    importData: () => void;
    saveFile: (content: string | Blob, fileName: string, fileType: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  }
}
