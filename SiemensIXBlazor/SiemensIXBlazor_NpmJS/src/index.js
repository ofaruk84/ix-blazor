import { defineCustomElements } from "@siemens/ix/loader";
import { toast, setToastPosition } from "@siemens/ix";
import "@siemens/ix-echarts";
import { registerTheme } from "@siemens/ix-echarts";
import * as echarts from "echarts";
import { themeSwitcher } from "@siemens/ix";
import { Grid } from "ag-grid-community";
import { defineCustomElements as ixIconsDefineCustomElements } from "@siemens/ix-icons/loader";

window.siemensIXInterop = {
  toastCounter: 0,
  toastResults: new Map(),

  async initialize() {
    await ixIconsDefineCustomElements(window, {
      resourcesUrl: "/_content/Siemens.IX.Blazor/",
    });
    await defineCustomElements();
    
    // Debug: Verify toastResults is accessible
    console.log("✅ toastResults initialized:", this.toastResults instanceof Map);
  },

  async showMessage(config) {
    try {
      const toastConfig = JSON.parse(config);
      
      if (toastConfig.messageHtml) {
        const msgEl = document.createElement('div');
        msgEl.innerHTML = toastConfig.messageHtml;
        toastConfig.message = msgEl;
      }

      if (toastConfig.action) {
        const actionEl = document.createElement('div');
        actionEl.innerHTML = toastConfig.action;
        actionEl.slot = 'action';
        toastConfig.action = actionEl;
      }

      if (toastConfig.position) {
        setToastPosition(toastConfig.position);
        delete toastConfig.position;
      }

      const toastContainer = document.querySelector('ix-toast-container');
      if (!toastContainer) {
        throw new Error('ix-toast-container not found in the DOM');
      }

      const toastId = `toast-${++this.toastCounter}`;
      const toastResult = await toastContainer.showToast(toastConfig);
      
      // Store the result object with metadata
      this.toastResults.set(toastId, {
        result: toastResult,
        isClosed: false
      });

      // Debug: Log current map size
      console.log(`✅ Toast ${toastId} added. Total active toasts: ${this.toastResults.size}`);

      toastResult.onClose.on(() => {
        const toastData = this.toastResults.get(toastId);
        if (toastData) {
          toastData.isClosed = true;
          console.log(`🔔 Toast ${toastId} closed. Scheduling cleanup...`);
          setTimeout(() => {
            this.toastResults.delete(toastId);
            console.log(`🗑️ Toast ${toastId} removed. Remaining: ${this.toastResults.size}`);
          }, 1000);
        }
      });

      return toastId;
    } catch (error) {
      console.error("Failed to display toast message:", error);
      throw error;
    }
  },

  pauseToast(toastId) {
    console.log(`⏸️ Attempting to pause ${toastId}. Map size: ${this.toastResults.size}`);
    const toastData = this.toastResults.get(toastId);
    
    if (!toastData) {
      console.warn(`❌ Toast ${toastId} not found in map. Available toasts:`, Array.from(this.toastResults.keys()));
      return false;
    }
    
    if (toastData.isClosed) {
      console.warn(`❌ Toast ${toastId} has already closed`);
      return false;
    }
    
    if (toastData.result?.pause) {
      toastData.result.pause();
      console.log(`✅ Toast ${toastId} paused successfully`);
      return true;
    }
    
    console.warn(`❌ Toast ${toastId} does not support pause`);
    return false;
  },

  resumeToast(toastId) {
    console.log(`▶️ Attempting to resume ${toastId}. Map size: ${this.toastResults.size}`);
    const toastData = this.toastResults.get(toastId);
    
    if (!toastData) {
      console.warn(`❌ Toast ${toastId} not found in map. Available toasts:`, Array.from(this.toastResults.keys()));
      return false;
    }
    
    if (toastData.isClosed) {
      console.warn(`❌ Toast ${toastId} has already closed`);
      return false;
    }
    
    if (toastData.result?.resume) {
      toastData.result.resume();
      console.log(`✅ Toast ${toastId} resumed successfully`);
      return true;
    }
    
    console.warn(`❌ Toast ${toastId} does not support resume`);
    return false;
  },

  async isToastPaused(toastId) {
    const toastData = this.toastResults.get(toastId);
    
    if (!toastData) {
      console.warn(`❌ Toast ${toastId} not found`);
      return null;
    }
    
    if (toastData.isClosed) {
      console.warn(`❌ Toast ${toastId} has already closed`);
      return null;
    }
    
    if (toastData.result?.isPaused) {
      const isPaused = await toastData.result.isPaused();
      console.log(`🔍 Toast ${toastId} paused status: ${isPaused}`);
      return isPaused;
    }
    
    return false;
  },

  closeToast(toastId, result) {
    console.log(`❌ Attempting to close ${toastId}`);
    const toastData = this.toastResults.get(toastId);
    
    if (!toastData) {
      console.warn(`❌ Toast ${toastId} not found`);
      return false;
    }
    
    if (toastData.isClosed) {
      console.warn(`❌ Toast ${toastId} already closed`);
      return false;
    }
    
    if (toastData.result?.close) {
      toastData.result.close(result);
      toastData.isClosed = true;
      console.log(`✅ Toast ${toastId} closed successfully`);
      return true;
    }
    
    console.warn(`❌ Toast ${toastId} does not support close`);
    return false;
  },

  isToastActive(toastId) {
    const toastData = this.toastResults.get(toastId);
    const isActive = toastData && !toastData.isClosed;
    console.log(`🔍 Toast ${toastId} active status: ${isActive}`);
    return isActive;
  },

  // Debug helper - call from browser console
  debugToasts() {
    console.log("📊 Toast Debug Info:");
    console.log("Total toasts in map:", this.toastResults.size);
    console.log("Toast IDs:", Array.from(this.toastResults.keys()));
    this.toastResults.forEach((data, id) => {
      console.log(`  ${id}:`, {
        isClosed: data.isClosed,
        hasPause: !!data.result?.pause,
        hasResume: !!data.result?.resume
      });
    });
  },

  // Rest of your code...
  initializeChart(id, options) {
    try {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Element with ID ${id} not found`);

      registerTheme(echarts);
      const myChart = echarts.init(element, window.demoTheme);
      myChart.setOption(JSON.parse(options));
    } catch (error) {
      console.error("Failed to initialize chart:", error);
    }
  },

  setTheme(theme) {
    themeSwitcher.setTheme(theme);
  },

  toggleTheme() {
    themeSwitcher.toggleMode();
  },

  toggleSystemTheme(useSystemTheme) {
    if (useSystemTheme) {
      themeSwitcher.setVariant();
    } else {
      console.warn("System theme switching is disabled.");
    }
  },

  agGridInterop: {
    dotnetReference: null,

    createGrid(dotnetRef, elementId, gridOptions) {
      const parsedOption = JSON.parse(gridOptions);
      this.dotnetReference = dotnetRef;

      parsedOption.onCellClicked = (event) => {
        dotnetRef.invokeMethodAsync("OnCellClickedCallback", event.data);
      };

      return new Grid(document.getElementById(elementId), parsedOption);
    },

    setData(grid, data) {
      grid.gridOptions.api.setRowData(data);
    },

    getSelectedRows(grid) {
      return grid.gridOptions.api.getSelectedRows();
    },

    dispose() {
      this.dotnetReference = null;
    },
  },
};

(async () => {
  await siemensIXInterop.initialize();
})();