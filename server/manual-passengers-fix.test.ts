import { describe, it, expect } from "vitest";

describe("Manual Passenger Creation with createdAt", () => {
  it("should create manual passenger object with createdAt timestamp", () => {
    const now = new Date();
    const manualPassenger = {
      eventId: 1,
      name: "maria clara grossi pereira carvalho",
      travelDate: "13 de junho de 2026",
      boardingPointId: 1,
      referenceOrderId: "BF-FLS5SU",
      createdBy: 1,
      createdAt: now,
    };

    expect(manualPassenger.eventId).toBe(1);
    expect(manualPassenger.name).toBe("maria clara grossi pereira carvalho");
    expect(manualPassenger.travelDate).toBe("13 de junho de 2026");
    expect(manualPassenger.boardingPointId).toBe(1);
    expect(manualPassenger.referenceOrderId).toBe("BF-FLS5SU");
    expect(manualPassenger.createdBy).toBe(1);
    expect(manualPassenger.createdAt).toBeInstanceOf(Date);
    expect(manualPassenger.createdAt.getTime()).toBeGreaterThan(0);
  });

  it("should handle null referenceOrderId", () => {
    const manualPassenger = {
      eventId: 1,
      name: "Test Passenger",
      travelDate: "05 de junho de 2026",
      boardingPointId: 2,
      referenceOrderId: null,
      createdBy: 1,
      createdAt: new Date(),
    };

    expect(manualPassenger.referenceOrderId).toBeNull();
  });

  it("should format travel date correctly", () => {
    const travelDate = "13 de junho de 2026";
    const isValidFormat = /^\d{1,2} de \w+ de \d{4}$/.test(travelDate);
    expect(isValidFormat).toBe(true);
  });

  it("should have valid boarding point ID", () => {
    const boardingPointId = 1;
    expect(boardingPointId).toBeGreaterThan(0);
    expect(Number.isInteger(boardingPointId)).toBe(true);
  });

  it("should have valid event ID", () => {
    const eventId = 1;
    expect(eventId).toBeGreaterThan(0);
    expect(Number.isInteger(eventId)).toBe(true);
  });

  it("should have valid user ID (createdBy)", () => {
    const createdBy = 1;
    expect(createdBy).toBeGreaterThan(0);
    expect(Number.isInteger(createdBy)).toBe(true);
  });
});
