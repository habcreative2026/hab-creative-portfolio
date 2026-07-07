// C:\desktop-app\test-clipboard.js

const { app, clipboard } = require("electron");

app.whenReady().then(() => {
  console.log("🧪 Testing clipboard on:", process.platform);

  const testText = "MAC-CLIPBOARD-TEST-" + Date.now().toString(36);

  try {
    // Test copy
    clipboard.writeText(testText);
    console.log("✅ Copy successful");

    // Test paste
    const pasted = clipboard.readText();
    console.log("📋 Pasted:", pasted);

    if (pasted === testText) {
      console.log("✅✅✅ CLIPBOARD TEST PASSED!");
      console.log("🎉 Clipboard works on", process.platform);
      process.exit(0);
    } else {
      console.log("❌ CLIPBOARD TEST FAILED!");
      console.log("  Expected:", testText);
      console.log("  Got:", pasted);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  app.quit();
});

setTimeout(() => {
  console.log("⏰ Timeout - quitting");
  process.exit(1);
}, 10000);
