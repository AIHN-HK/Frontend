import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { isAxiosError } from "axios";
import type { AdminIdentity } from "./types";
export const AdminContext = createContext<{
  identity: AdminIdentity;
  token: string;
} | null>(null);
export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("Admin context missing");
  return value;
}
// Drafts survive navigation/expired-token re-login in this tab, scoped to owner.
// They are intentionally not persisted to disk and disappear on page reload.
const drafts = new Map<string, unknown>();
export function useAdminDraft<T>(kind: string, initial: T) {
  const { identity } = useAdmin();
  const key = `${identity.id}:${kind}`;
  const [value, setValue] = useState<T>(() =>
    drafts.has(key) ? (drafts.get(key) as T) : initial,
  );
  const current = useRef(value);
  const setDraft = useCallback(
    (next: SetStateAction<T>) => {
      const updated =
        typeof next === "function"
          ? (next as (value: T) => T)(current.current)
          : next;
      current.current = updated;
      drafts.set(key, updated);
      setValue(updated);
    },
    [key],
  );
  return [value, setDraft] as const;
}
export function adminError(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === "SESSION_CHANGED")
      return "Tài khoản đã thay đổi. Hãy tải lại trang.";
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join("\n");
    if (!error.response)
      return "Không thể kết nối máy chủ. Hãy kiểm tra mạng và thử lại.";
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}
export function useAdminResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void load()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((err) => {
        if (active) setError(adminError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, revision]);
  return { data, error, loading, reload: () => setRevision((v) => v + 1) };
}
export function useAdminSave() {
  const inFlight = useRef(false),
    mounted = useRef(true);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    busy,
    message,
    error,
    clear: () => {
      setError("");
      setMessage("");
    },
    run: async (
      action: () => Promise<void>,
      success: string,
    ): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(true);
      setError("");
      setMessage("");
      try {
        await action();
        if (!mounted.current) return false;
        setMessage(success);
        return true;
      } catch (err) {
        if (mounted.current) setError(adminError(err));
        return false;
      } finally {
        inFlight.current = false;
        if (mounted.current) setBusy(false);
      }
    },
  };
}
