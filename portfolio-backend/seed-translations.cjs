// backend/seed-translations.cjs
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Translation = require("./src/models/Translation");

// ===================== PATH TỚI FILE =====================
const TRANSLATIONS_FILE = path.join(
  __dirname,
  "../portfolio-frontend/app/i18n/translations.ts",
);

// ===================== PARSE FILE TS =====================
function parseTranslationsFile(filePath) {
  console.log(`📖 Reading: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Bỏ dòng `export const translations = ` ở đầu
  // Regex match toàn bộ object từ `{` đầu tiên đến `}` cuối cùng trước dấu `;`
  const match = content.match(
    /export\s+const\s+translations\s*=\s*(\{[\s\S]*\})\s*;?\s*$/m,
  );

  if (!match) {
    throw new Error("Không parse được object translations từ file");
  }

  let objectString = match[1];

  // Dùng `new Function` để eval an toàn (không cần eval global)
  const fn = new Function(`return (${objectString})`);
  return fn();
}

// ===================== MAIN =====================
async function seed() {
  try {
    console.log("🚀 Seed script started\n");

    // 1. Parse file translations.ts
    const translations = parseTranslationsFile(TRANSLATIONS_FILE);

    const viCount = Object.keys(translations.vi || {}).length;
    const enCount = Object.keys(translations.en || {}).length;
    const deCount = Object.keys(translations.de || {}).length;

    console.log("✅ Parsed translations:");
    console.log(`   - VI: ${viCount} keys`);
    console.log(`   - EN: ${enCount} keys`);
    console.log(`   - DE: ${deCount} keys`);

    // 2. Kết nối MongoDB
    console.log("\n🔌 Connecting to MongoDB...");
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "Không tìm thấy MONGODB_URI hoặc MONGO_URI trong file .env",
      );
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // 3. Union tất cả keys
    const allKeys = new Set([
      ...Object.keys(translations.vi || {}),
      ...Object.keys(translations.en || {}),
      ...Object.keys(translations.de || {}),
    ]);

    const keyArray = Array.from(allKeys);
    console.log(`\n📦 Found ${keyArray.length} unique keys`);

    // 4. Bulk operations
    const bulkOps = keyArray.map((key) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            key,
            vi: translations.vi?.[key] || "",
            en: translations.en?.[key] || "",
            de: translations.de?.[key] || "",
            category: "Bùi Hải Trọng",
          },
        },
        upsert: true,
      },
    }));

    // 5. Execute
    console.log("💾 Inserting to database...");
    const result = await Translation.bulkWrite(bulkOps);

    console.log("\n✅ SEED THÀNH CÔNG!");
    console.log(`   - Inserted (new): ${result.upsertedCount}`);
    console.log(`   - Updated (existing): ${result.modifiedCount}`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Total keys: ${keyArray.length}`);

    // 6. Verify
    const totalInDb = await Translation.countDocuments();
    console.log(`\n📊 Total documents in DB: ${totalInDb}`);

    await mongoose.connection.close();
    console.log("👋 Disconnected");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEED ERROR:");
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

seed();
