#!/usr/bin/env node

/**
 * Backfill script to fix corrupted dates in existing orders
 * Fixes dates that are:
 * - "Invalid Date"
 * - Year 2001 instead of 2026
 * - Malformed formats
 * 
 * Usage: node server/backfill-corrupted-dates.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { orders } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

// Date normalizer function (same as server/lib/date-normalizer.ts)
function normalizeDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  dateStr = dateStr.trim();
  
  // ISO format: 2026-06-05 or 2026-06-05T00:00:00Z
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0], 10);
    const month = parts[1];
    const day = parts[2].substring(0, 2);
    
    // Fix invalid year
    if (year < 2020 || year > 2030) {
      year = 2026;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Brazilian format: 05/06/2026
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const parts = dateStr.split('/');
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parseInt(parts[2], 10);
    
    if (year < 2020 || year > 2030) {
      year = 2026;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Portuguese format with prepositions: 05 de junho de 2026
  if (dateStr.match(/^\d{1,2}\s+de\s+\w+\s+de\s+\d{4}$/i)) {
    const parts = dateStr.split(/\s+de\s+/i);
    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1].toLowerCase();
    let year = parseInt(parts[2], 10);
    
    const monthMap = {
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
      'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
      'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    
    const month = monthMap[monthStr];
    if (!month) return null;
    
    if (year < 2020 || year > 2030) {
      year = 2026;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Short Portuguese format: 12 Junho or 12 junho (without year - assume 2026)
  if (dateStr.match(/^\d{1,2}\s+[a-záéíóúãõç]+$/i)) {
    const parts = dateStr.split(/\s+/i);
    if (parts.length === 2) {
      const day = parts[0].padStart(2, '0');
      const monthStr = parts[1].toLowerCase();
      
      const monthMap = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      
      const month = monthMap[monthStr];
      if (!month) return null;
      
      return `2026-${month}-${day}`;
    }
  }
  
  return null;
}

function normalizeDateArray(dates) {
  let dateArray = [];
  
  if (typeof dates === 'string') {
    try {
      dateArray = JSON.parse(dates);
    } catch {
      dateArray = [dates];
    }
  } else if (Array.isArray(dates)) {
    dateArray = dates;
  }
  
  return dateArray
    .map(d => normalizeDateString(d))
    .filter(d => d !== null);
}

async function backfillCorruptedDates() {
  console.log("🔄 Starting backfill of corrupted dates...\n");
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // Get all orders
    const allOrders = await db.select().from(orders);
    console.log(`📊 Total orders in database: ${allOrders.length}\n`);
    
    let fixedCount = 0;
    let invalidCount = 0;
    const issues = [];
    
    for (const order of allOrders) {
      const originalDates = order.transportDates;
      let needsUpdate = false;
      let normalizedDates = null;
      
      // Check if dates need fixing
      if (originalDates) {
        try {
          // Try to parse as JSON
          let dateArray = [];
          if (typeof originalDates === 'string') {
            try {
              dateArray = JSON.parse(originalDates);
            } catch {
              dateArray = [originalDates];
            }
          } else if (Array.isArray(originalDates)) {
            dateArray = originalDates;
          }
          
          // Check for corrupted dates
          for (const date of dateArray) {
            if (date === 'Invalid Date' || date.includes('2001') || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
              needsUpdate = true;
              break;
            }
          }
          
          // Normalize if needed
          if (needsUpdate) {
            normalizedDates = normalizeDateArray(originalDates);
            if (normalizedDates && normalizedDates.length > 0) {
              fixedCount++;
              issues.push({
                orderId: order.id,
                shortId: order.shortId,
                before: originalDates,
                after: JSON.stringify(normalizedDates)
              });
            } else {
              invalidCount++;
            }
          }
        } catch (e) {
          invalidCount++;
          issues.push({
            orderId: order.id,
            shortId: order.shortId,
            error: e.message
          });
        }
      }
    }
    
    console.log(`\n📋 Analysis Results:`);
    console.log(`   ✅ Orders to fix: ${fixedCount}`);
    console.log(`   ❌ Unfixable orders: ${invalidCount}`);
    
    if (fixedCount > 0) {
      console.log(`\n🔧 Applying fixes...\n`);
      
      let appliedCount = 0;
      for (const issue of issues) {
        if (issue.after) {
          try {
            await db.update(orders)
              .set({ transportDates: issue.after })
              .where(eq(orders.id, issue.orderId));
            
            appliedCount++;
            console.log(`   ✓ Order ${issue.shortId} (ID: ${issue.orderId})`);
            console.log(`     Before: ${issue.before}`);
            console.log(`     After:  ${issue.after}\n`);
          } catch (e) {
            console.log(`   ✗ Order ${issue.shortId} (ID: ${issue.orderId}) - Error: ${e.message}\n`);
          }
        }
      }
      
      console.log(`\n✅ Backfill completed!`);
      console.log(`   Fixed: ${appliedCount} orders`);
      console.log(`   Failed: ${fixedCount - appliedCount} orders`);
    } else {
      console.log(`\n✅ No corrupted dates found. Database is clean!`);
    }
    
  } catch (error) {
    console.error("❌ Error during backfill:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

backfillCorruptedDates();
