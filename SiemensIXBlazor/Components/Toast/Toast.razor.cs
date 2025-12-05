// -----------------------------------------------------------------------
// SPDX-FileCopyrightText: 2024 Siemens AG
//
// SPDX-License-Identifier: MIT
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//  -----------------------------------------------------------------------

using Microsoft.JSInterop;
using Newtonsoft.Json;
using SiemensIXBlazor.Objects;

namespace SiemensIXBlazor.Components
{
    public partial class Toast
    {
        public async Task<ToastReference> ShowToast(ToastConfig config)
        {
            if (config == null)
            {
                throw new ArgumentNullException(nameof(config), "Toast configuration cannot be null");
            }

            try
            {
                // The JS interop will return a toast ID that we can use to control the toast
                var toastId = await JSRuntime.InvokeAsync<string>(
                    "siemensIXInterop.showMessage", 
                    JsonConvert.SerializeObject(config)
                );
                
                return new ToastReference(toastId, JSRuntime);
            }
            catch (JSException jsException)
            {
                throw;
            }
        }
    }
}
