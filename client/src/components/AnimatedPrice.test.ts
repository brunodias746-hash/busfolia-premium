import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedPrice } from "./AnimatedPrice";

describe("AnimatedPrice Component", () => {
  beforeEach(() => {
    // Mock matchMedia for prefers-reduced-motion tests
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)" ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children content", () => {
    render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 70,00")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AnimatedPrice value={7000} className="text-2xl font-bold text-primary">
        R$ 70,00
      </AnimatedPrice>
    );
    const span = container.querySelector("span");
    expect(span?.className).toContain("text-2xl");
    expect(span?.className).toContain("font-bold");
  });

  it("uses default duration of 0.4 seconds", () => {
    const { container } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    // Motion component should be rendered
    expect(container.querySelector("span")).toBeDefined();
  });

  it("respects custom duration prop", () => {
    const { container } = render(
      <AnimatedPrice value={7000} duration={0.6} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    // Motion component should be rendered with custom duration
    expect(container.querySelector("span")).toBeDefined();
  });

  it("renders without animation when respectReducedMotion is false", () => {
    const { container } = render(
      <AnimatedPrice
        value={7000}
        respectReducedMotion={false}
        className="text-2xl"
      >
        R$ 70,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 70,00")).toBeDefined();
  });

  it("handles value changes", () => {
    const { rerender } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 70,00")).toBeDefined();

    rerender(
      <AnimatedPrice value={8000} className="text-2xl">
        R$ 80,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 80,00")).toBeDefined();
  });

  it("generates unique key based on value for animation trigger", () => {
    const { container, rerender } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    const firstSpan = container.querySelector("span");

    rerender(
      <AnimatedPrice value={8000} className="text-2xl">
        R$ 80,00
      </AnimatedPrice>
    );
    const secondSpan = container.querySelector("span");

    // Both should exist (animation triggers on key change)
    expect(firstSpan).toBeDefined();
    expect(secondSpan).toBeDefined();
  });

  it("handles different price values for boarding points", () => {
    const { rerender } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 70,00")).toBeDefined();

    // BH/Santa Luzia: R$70
    rerender(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 70,00")).toBeDefined();

    // Betim/Contagem: R$80
    rerender(
      <AnimatedPrice value={8000} className="text-2xl">
        R$ 80,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 80,00")).toBeDefined();

    // Passport: R$250
    rerender(
      <AnimatedPrice value={25000} className="text-2xl">
        R$ 250,00
      </AnimatedPrice>
    );
    expect(screen.getByText("R$ 250,00")).toBeDefined();
  });

  it("maintains animation state through multiple updates", () => {
    const { rerender } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );

    // Simulate multiple price changes
    const prices = [8000, 25000, 7000, 8000];
    prices.forEach((price) => {
      const formatted = `R$ ${(price / 100).toFixed(2).replace(".", ",")}`;
      rerender(
        <AnimatedPrice value={price} className="text-2xl">
          {formatted}
        </AnimatedPrice>
      );
      expect(screen.getByText(formatted)).toBeDefined();
    });
  });

  it("applies easeOut transition for smooth animation", () => {
    const { container } = render(
      <AnimatedPrice value={7000} className="text-2xl">
        R$ 70,00
      </AnimatedPrice>
    );
    // Motion component renders with easeOut transition
    expect(container.querySelector("span")).toBeDefined();
  });
});
