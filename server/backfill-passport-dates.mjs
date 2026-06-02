import { getDb } from "./db.ts";
import { orders } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const PLRS_2026_EVENT_DATES = [
  "05 de junho de 2026",
  "06 de junho de 2026",
  "12 de junho de 2026",
  "13 de junho de 2026",
];

async function backfillPassportDates() {
  console.log("🔄 Starting passport dates backfill...");

  try {
    const db = await getDb();

    // Find all orders with purchaseType = 'all_days'
    const passportOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.purchaseType, "all_days"));

    console.log(`Found ${passportOrders.length} passport orders`);

    let fixed = 0;
    let skipped = 0;

    for (const order of passportOrders) {
      try {
        const currentDates = JSON.parse(order.transportDates || "[]");
        
        // Check if dates need fixing
        if (JSON.stringify(currentDates) === JSON.stringify(["Todos os Dias"]) ||
            !Array.isArray(currentDates) ||
            currentDates.length !== 4 ||
            !currentDates.every(d => PLRS_2026_EVENT_DATES.includes(d))) {
          
          // Update with correct dates
          await db
            .update(orders)
            .set({ transportDates: JSON.stringify(PLRS_2026_EVENT_DATES) })
            .where(eq(orders.id, order.id));
          
          console.log(`✅ Fixed order ${order.shortId} (${order.name})`);
          fixed++;
        } else {
          console.log(`⏭️  Skipped order ${order.shortId} (already correct)`);
          skipped++;
        }
      } catch (err) {
        console.error(`❌ Error processing order ${order.shortId}:`, err.message);
      }
    }

    console.log(`\n📊 Backfill complete:`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${passportOrders.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  }
}

backfillPassportDates();
