import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActivityDetector from "./ActivityDetector";

const STORAGE_KEY_PREFIX = "React_Activity_Detector_Idle_Timer-";

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

  test("multiple instances sharing a name do not clobber each other's idle timers", () => {
    const onIdleA = jest.fn();
    const onIdleB = jest.fn();

    render(
      <>
        <ActivityDetector
          name="shared"
          enabled={true}
          timeout={1000}
          onIdle={onIdleA}
        />
        <ActivityDetector
          name="shared"
          enabled={true}
          timeout={1000}
          onIdle={onIdleB}
        />
      </>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onIdleA).toHaveBeenCalled();
    expect(onIdleB).toHaveBeenCalled();
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

  test("does not call onIdle or write to storage when disabled", () => {
    const onIdle = jest.fn();
    render(<ActivityDetector enabled={false} timeout={1000} onIdle={onIdle} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onIdle).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY_PREFIX + "default")).toBeNull();
  });

  test("starts the idle timer once enabled after being disabled", () => {
    const onIdle = jest.fn();
    const { rerender } = render(
      <ActivityDetector enabled={false} timeout={1000} onIdle={onIdle} />
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    rerender(<ActivityDetector enabled={true} timeout={1000} onIdle={onIdle} />);
    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  test("calls the latest onActive after the prop changes", () => {
    const firstOnActive = jest.fn();
    const secondOnActive = jest.fn();
    const { rerender } = render(
      <ActivityDetector
        enabled={true}
        activityEvents={["click"]}
        onActive={firstOnActive}
      />
    );

    rerender(
      <ActivityDetector
        enabled={true}
        activityEvents={["click"]}
        onActive={secondOnActive}
      />
    );
    act(() => {
      window.dispatchEvent(new Event("click"));
    });

    expect(firstOnActive).not.toHaveBeenCalled();
    expect(secondOnActive).toHaveBeenCalledTimes(1);
  });

  test("calls the latest onIdle after the prop changes", () => {
    const firstOnIdle = jest.fn();
    const secondOnIdle = jest.fn();
    const { rerender } = render(
      <ActivityDetector enabled={true} timeout={1000} onIdle={firstOnIdle} />
    );

    rerender(
      <ActivityDetector enabled={true} timeout={1000} onIdle={secondOnIdle} />
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(firstOnIdle).not.toHaveBeenCalled();
    expect(secondOnIdle).toHaveBeenCalledTimes(1);
  });

  test("listens for the new activity events after the prop changes", () => {
    const onActive = jest.fn();
    const { rerender } = render(
      <ActivityDetector
        enabled={true}
        activityEvents={["click"]}
        onActive={onActive}
      />
    );

    rerender(
      <ActivityDetector
        enabled={true}
        activityEvents={["keydown"]}
        onActive={onActive}
      />
    );
    act(() => {
      window.dispatchEvent(new Event("click"));
    });
    expect(onActive).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event("keydown"));
    });
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  test("does not reset the idle timer when re-rendered with an equal activityEvents array", () => {
    const onIdle = jest.fn();
    const { rerender } = render(
      <ActivityDetector
        enabled={true}
        timeout={1000}
        activityEvents={["click"]}
        onIdle={onIdle}
      />
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender(
      <ActivityDetector
        enabled={true}
        timeout={1000}
        activityEvents={["click"]}
        onIdle={onIdle}
      />
    );
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  test("follows cross-tab updates for the new name after the prop changes", () => {
    const onIdle = jest.fn();
    const { rerender } = render(
      <ActivityDetector name="a" enabled={true} timeout={1000} onIdle={onIdle} />
    );

    rerender(
      <ActivityDetector name="b" enabled={true} timeout={1000} onIdle={onIdle} />
    );
    // Another tab using name "b" reports activity that pushes the deadline out.
    const laterDeadline = String(Date.now() + 5000);
    localStorage.setItem(STORAGE_KEY_PREFIX + "b", laterDeadline);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY_PREFIX + "b",
          newValue: laterDeadline,
        })
      );
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  test("ignores a storage event that removes the key", () => {
    const onIdle = jest.fn();
    render(<ActivityDetector enabled={true} timeout={1000} onIdle={onIdle} />);

    act(() => {
      localStorage.removeItem(STORAGE_KEY_PREFIX + "default");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY_PREFIX + "default",
          newValue: null,
        })
      );
      jest.advanceTimersByTime(0);
    });
    expect(onIdle).not.toHaveBeenCalled();

    // The local deadline still applies.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  test("keeps working when localStorage throws", () => {
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });
    const getItem = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });

    try {
      const onIdle = jest.fn();
      render(<ActivityDetector enabled={true} timeout={1000} onIdle={onIdle} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onIdle).toHaveBeenCalledTimes(1);
    } finally {
      setItem.mockRestore();
      getItem.mockRestore();
    }
  });
});
