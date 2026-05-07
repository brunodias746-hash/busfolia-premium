# 📅 Date Standardization Guide - BusFolia Premium

**Version:** 1.0  
**Last Updated:** May 7, 2026  
**Status:** ACTIVE

---

## 🎯 Standard Date Format

### Display Format (User-Facing)
```
"05 de junho de 2026"
```

**Rules:**
- Portuguese language (lowercase)
- Format: `{day} de {month} de {year}`
- Day: 1-31 (no leading zero)
- Month: Full Portuguese month name (lowercase)
- Year: 4 digits (2026)

### Storage Format (Database)
```
ISO 8601: "2026-06-05"
```

**Rules:**
- Format: `YYYY-MM-DD`
- Always UTC timezone
- No time component for date-only fields
- Use TIMESTAMP for date+time fields

### API Format (JSON Responses)
```json
{
  "eventDate": "2026-06-05",
  "transportDate": "05 de junho de 2026",
  "createdAt": "2026-05-07T15:30:45Z"
}
```

**Rules:**
- ISO format for storage/API transfer
- Portuguese format for display
- Timestamps include time and timezone

---

## 🔄 Conversion Guide

### Frontend: Display Dates to Users

```typescript
import { formatDatePortuguese } from "@/lib/dateFormatter";

// From any format
const displayDate = formatDatePortuguese("2026-06-05");
// Result: "5 de junho de 2026"

const displayDate2 = formatDatePortuguese("05/06/2026");
// Result: "5 de junho de 2026"

const displayDate3 = formatDatePortuguese("05 Junho 2026");
// Result: "5 de junho de 2026"
```

### Backend: Format for Emails

```typescript
import { formatDatesInPortuguese } from "@/server/_core/email";

const dates = ["2026-06-05", "2026-06-06"];
const formatted = formatDatesInPortuguese(dates);
// Result: "5 de Junho de 2026, 6 de Junho de 2026"
```

### Export to Excel/CSV

```typescript
import { formatDateForXLSX } from "@/lib/xlsxExport";

const excelDate = formatDateForXLSX("2026-06-05");
// Result: "05/06/2026"
```

---

## ✅ Validation Rules

### Year Validation
- **Valid Range:** 2020 - 2030
- **Fallback Year:** 2026 (for dates without year)
- **Invalid Years:** 2001, 2019, 2031+ (rejected)

### Date Validation

```typescript
import { isValidDate, hasInvalidYear } from "@/lib/dateFormatter";

// Check if date is valid
if (isValidDate("2026-06-05")) {
  // Process date
}

// Check for invalid years
if (hasInvalidYear("2001-06-05")) {
  // Reject date
}
```

---

## 🚫 What NOT to Do

### ❌ Anti-Patterns

```typescript
// DON'T: Use new Date() without timezone
const date = new Date("05/06");  // Ambiguous, may parse to 2001

// DON'T: Hardcode dates without year
const travelDate = "05 Junho";  // Missing year

// DON'T: Use inconsistent formatting
const date1 = "05/06/2026";
const date2 = "05 de junho de 2026";
const date3 = "2026-06-05";  // Three different formats!

// DON'T: Rely on browser locale
const date = new Date().toLocaleDateString();  // May vary by browser

// DON'T: Store dates as strings without validation
const eventDate = "05 Junho";  // No year, risky!

// DON'T: Use timezone-dependent operations
const date = new Date("2026-06-05");  // May shift by timezone
```

### ✅ Correct Patterns

```typescript
// DO: Use ISO format for parsing
const date = new Date("2026-06-05T00:00:00Z");

// DO: Include year in all date strings
const travelDate = "05 de junho de 2026";

// DO: Use centralized formatting function
import { formatDatePortuguese } from "@/lib/dateFormatter";
const display = formatDatePortuguese("2026-06-05");

// DO: Use explicit locale
const date = new Date().toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// DO: Validate dates on input
if (isValidDate(userInput)) {
  // Process
}

// DO: Use UTC for storage
const timestamp = new Date().toISOString();  // "2026-05-07T15:30:45Z"
```

---

## 📍 Where to Use Each Format

| Location | Format | Example | Function |
|----------|--------|---------|----------|
| Database | ISO | 2026-06-05 | `new Date()` |
| API JSON | ISO | "2026-06-05" | JSON.stringify() |
| User Display | Portuguese | "5 de junho de 2026" | `formatDatePortuguese()` |
| Email | Portuguese | "5 de Junho de 2026" | `formatDatesInPortuguese()` |
| Excel/CSV | Brazilian | 05/06/2026 | `formatDateForXLSX()` |
| Filename | ISO | 2026-05-07 | `new Date().toISOString()` |
| URL Query | ISO | 2026-06-05 | URL encoding |

---

## 🔧 Implementation Checklist

### When Adding a New Date Field

- [ ] **Database:** Use ISO format (YYYY-MM-DD)
- [ ] **API Response:** Return ISO format
- [ ] **Frontend Display:** Use `formatDatePortuguese()`
- [ ] **Validation:** Check with `isValidDate()`
- [ ] **Tests:** Add tests for all formats
- [ ] **Documentation:** Update this guide

### When Creating a New Page

- [ ] **Import:** `import { formatDatePortuguese } from "@/lib/dateFormatter"`
- [ ] **Display:** Use `formatDatePortuguese()` for all user-facing dates
- [ ] **Validation:** Validate date inputs
- [ ] **Tests:** Test with multiple date formats
- [ ] **Timezone:** Ensure UTC handling

### When Creating an Email Template

- [ ] **Import:** `import { formatDatesInPortuguese } from "@/server/_core/email"`
- [ ] **Format:** Use `formatDatesInPortuguese()` for date arrays
- [ ] **Validation:** Ensure dates have years
- [ ] **Tests:** Test with various date inputs

---

## 🧪 Testing Dates

### Unit Tests

```typescript
import { formatDatePortuguese, isValidDate } from "@/lib/dateFormatter";

describe("Date Formatting", () => {
  it("should format ISO to Portuguese", () => {
    expect(formatDatePortuguese("2026-06-05")).toBe("5 de junho de 2026");
  });

  it("should validate correct years", () => {
    expect(isValidDate("2026-06-05")).toBe(true);
  });

  it("should reject invalid years", () => {
    expect(isValidDate("2001-06-05")).toBe(false);
  });
});
```

### Manual Testing

1. **Event Page:** Verify dates display as "5 de junho de 2026"
2. **Checkout:** Verify selected dates maintain year
3. **Confirmation:** Verify email shows correct dates
4. **Ticket:** Verify PDF shows correct dates
5. **Admin:** Verify exports show correct dates

---

## 🐛 Debugging Date Issues

### Symptom: Year shows as 2001

**Cause:** `new Date("05 Junho")` without year  
**Solution:** Use `formatDatePortuguese()` which defaults to 2026

### Symptom: Date shifts by timezone

**Cause:** Using local timezone instead of UTC  
**Solution:** Use ISO format: `"2026-06-05T00:00:00Z"`

### Symptom: Different formats in different places

**Cause:** Inconsistent formatting functions  
**Solution:** Always use `formatDatePortuguese()` for display

### Symptom: Export shows wrong date

**Cause:** Timezone conversion in export  
**Solution:** Use `formatDateForXLSX()` which handles timezone

---

## 📞 Support & Questions

### Common Questions

**Q: Can I use `new Date()` directly?**  
A: Only for timestamps. For date-only fields, use ISO format: `new Date("2026-06-05")`

**Q: What if user enters date without year?**  
A: Validate with `isValidDate()`. If invalid, prompt user to enter year.

**Q: Should I store timezone with dates?**  
A: No. Store dates as UTC. Store timezone separately if needed.

**Q: Can I use different date formats in different pages?**  
A: No. Always use the standard format. Use centralized functions.

---

## 📚 Related Files

- **Frontend Formatter:** `client/src/lib/dateFormatter.ts`
- **Backend Email:** `server/_core/email.ts`
- **Export Functions:** `client/src/lib/xlsxExport.ts`
- **Tests:** `server/date-*.test.ts`
- **Audit Report:** `DATE_AUDIT_REPORT.md`

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-07 | Initial standardization guide |

---

**Last Review:** May 7, 2026  
**Next Review:** August 7, 2026  
**Maintainer:** Manus AI Agent
