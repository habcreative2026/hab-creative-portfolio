const { test, expect } = require("@playwright/test");

test.describe("Test copy function on MacOS", () => {
  test("should copy device ID using execCommand", async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <div id="deviceId">test-device-id-12345</div>
        <button id="copyBtn">Copy</button>
        <div id="status"></div>
        <div id="result"></div>
        
        <script>
          function copyDeviceId() {
            const deviceId = document.getElementById('deviceId').textContent;
            const status = document.getElementById('status');
            const result = document.getElementById('result');
            
            // Method 1: execCommand (MacOS way)
            try {
              const textArea = document.createElement('textarea');
              textArea.value = deviceId;
              textArea.style.position = 'fixed';
              textArea.style.left = '-9999px';
              textArea.style.top = '-9999px';
              document.body.appendChild(textArea);
              textArea.select();
              
              const success = document.execCommand('copy');
              textArea.remove();
              
              if (success) {
                status.textContent = 'Success';
                status.style.color = 'green';
                result.textContent = 'Copied: ' + deviceId;
                
                // Verify by reading clipboard
                navigator.clipboard.readText().then(text => {
                  result.textContent = 'Verified: ' + text;
                }).catch(() => {});
                
                return true;
              }
            } catch (err) {
              console.error('execCommand failed:', err);
            }
            
            // Method 2: Clipboard API (fallback)
            if (navigator.clipboard) {
              navigator.clipboard.writeText(deviceId).then(() => {
                status.textContent = 'Success (Clipboard API)';
                status.style.color = 'green';
                result.textContent = 'Copied: ' + deviceId;
              }).catch(() => {
                status.textContent = 'Failed';
                status.style.color = 'red';
              });
            }
            
            return false;
          }
          
          document.getElementById('copyBtn').addEventListener('click', copyDeviceId);
          
          // Auto run test
          setTimeout(copyDeviceId, 1000);
        </script>
      </body>
      </html>
    `;

    // Load HTML
    await page.setContent(html);

    // Wait for auto copy
    await page.waitForTimeout(1500);

    // Check status
    const status = await page.locator("#status");
    await expect(status).toHaveText(/Success/);

    // Check clipboard content
    const result = await page.locator("#result");
    await expect(result).toContainText("test-device-id-12345");
  });

  test("should copy when button is clicked", async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <div id="deviceId">click-test-device-67890</div>
        <button id="copyBtn">Copy</button>
        <div id="status"></div>
        
        <script>
          function copyDeviceId() {
            const deviceId = document.getElementById('deviceId').textContent;
            const status = document.getElementById('status');
            
            try {
              const textArea = document.createElement('textarea');
              textArea.value = deviceId;
              textArea.style.position = 'fixed';
              textArea.style.left = '-9999px';
              document.body.appendChild(textArea);
              textArea.select();
              const success = document.execCommand('copy');
              textArea.remove();
              
              status.textContent = success ? 'Success' : 'Failed';
              status.style.color = success ? 'green' : 'red';
            } catch (err) {
              status.textContent = 'Error: ' + err.message;
              status.style.color = 'red';
            }
          }
          
          document.getElementById('copyBtn').addEventListener('click', copyDeviceId);
        </script>
      </body>
      </html>
    `;

    await page.setContent(html);

    await page.click("#copyBtn");
    await page.waitForTimeout(500);

    const status = await page.locator("#status");
    await expect(status).toHaveText("Success");
  });
});
