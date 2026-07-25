import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `fn` whenever `deps` change, tracking loading/data/error state.
 * `enabled` lets callers skip the call (e.g. no student_id yet) without
 * juggling conditional hooks.
 */
export function useAsync(fn, deps, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const requestId = useRef(0);

  const run = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (id === requestId.current) setData(result);
      })
      .catch((err) => {
        if (id === requestId.current) setError(err);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, refetch: run, setData };
}

/**
 * Fetches a protected binary endpoint (profile picture, LinkedIn screenshot) as a blob and
 * exposes it as an object URL — these all require the `Authorization` header, so a plain
 * `<img src="...">` can't be used directly. Revokes the previous URL on refetch/unmount.
 */
export function useBlobUrl(fetchFn, deps, { enabled = true } = {}) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const objectUrlRef = useRef(null);

  const run = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((blob) => {
        if (id !== requestId.current) return;
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = blob ? URL.createObjectURL(blob) : null;
        setUrl(objectUrlRef.current);
      })
      .catch((err) => {
        if (id === requestId.current) setError(err);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  return { url, loading, error };
}

/** For POST/PUT-style actions triggered by user events, not on mount. */
export function useAction(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { execute, loading, error, setError };
}
