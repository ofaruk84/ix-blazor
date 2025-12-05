using Microsoft.JSInterop;


namespace SiemensIXBlazor.Objects
{
    public class ToastReference
    {
        private readonly string _toastId;
        private readonly IJSRuntime _jsRuntime;

        public string ToastId => _toastId;

        internal ToastReference(string toastId, IJSRuntime jsRuntime)
        {
            _toastId = toastId;
            _jsRuntime = jsRuntime;
        }

        /// <summary>
        /// Pauses the auto-close timer for this toast
        /// </summary>
        public async Task Pause()
        {
            await _jsRuntime.InvokeVoidAsync("siemensIXInterop.pauseToast", _toastId);
        }

        /// <summary>
        /// Resumes the auto-close timer for this toast
        /// </summary>
        public async Task Resume()
        {
            await _jsRuntime.InvokeVoidAsync("siemensIXInterop.resumeToast", _toastId);
        }

        /// <summary>
        /// Checks if this toast is currently paused
        /// </summary>
        public async Task<bool> IsPaused()
        {
            return await _jsRuntime.InvokeAsync<bool>("siemensIXInterop.isToastPaused", _toastId);
        }

        /// <summary>
        /// Manually closes this toast
        /// </summary>
        public async Task Close(object? result = null)
        {
            await _jsRuntime.InvokeVoidAsync("siemensIXInterop.closeToast", _toastId, result);
        }
    }
}

