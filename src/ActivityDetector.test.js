import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActivityDetector from "./ActivityDetector";

describe("ActivityDetector", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders without crashing", () => {
    render(<ActivityDetector enabled={false} />);
  });

  test("calls onIdle after the configured timeout when enabled", () => {
    const onIdle = jest.fn();
    render(<ActivityDetector enabled={true} timeout={1000} onIdle={onIdle} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onIdle).toHaveBeenCalled();
  });

  test("does not call onIdle before the timeout elapses", () => {
    const onIdle = jest.fn();
    render(<ActivityDetector enabled={true} timeout={5000} onIdle={onIdle} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });

  test("calls onActive when a tracked activity event fires", () => {
    const onActive = jest.fn();
    render(
      <ActivityDetector
        enabled={true}
        timeout={5000}
        activityEvents={["click"]}
        onActive={onActive}
      />
    );

    act(() => {
      window.dispatchEvent(new Event("click"));
    });

    expect(onActive).toHaveBeenCalled();
  });

  test("does not attach activity listeners when disabled", () => {
    const onActive = jest.fn();
    render(
      <ActivityDetector
        enabled={false}
        activityEvents={["click"]}
        onActive={onActive}
      />
    );

    act(() => {
      window.dispatchEvent(new Event("click"));
    });

    expect(onActive).not.toHaveBeenCalled();
  });
});
