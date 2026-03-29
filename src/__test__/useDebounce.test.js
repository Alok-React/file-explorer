import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useDebounce', () => {
  test('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  test('does not update before the delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });
    rerender({ value: 'updated' });
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe('initial');
  });

  test('updates after the delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });
    rerender({ value: 'updated' });
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('updated');
  });

  test('resets the timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(200); });
    rerender({ value: 'c' });
    act(() => { jest.advanceTimersByTime(200); });
    // Only 200ms passed since 'c' — should still be 'a'
    expect(result.current).toBe('a');
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe('c');
  });

  test('uses 300ms default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'start' },
    });
    rerender({ value: 'end' });
    act(() => { jest.advanceTimersByTime(299); });
    expect(result.current).toBe('start');
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('end');
  });

  test('cleans up timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'start' },
    });
    rerender({ value: 'end' });
    unmount();
    act(() => { jest.advanceTimersByTime(300); });
    // Should not throw / update after unmount
    expect(result.current).toBe('start');
  });

  test('handles numeric values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 0 },
    });
    rerender({ value: 42 });
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe(42);
  });

  test('handles empty string', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'search text' },
    });
    rerender({ value: '' });
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('');
  });
});
