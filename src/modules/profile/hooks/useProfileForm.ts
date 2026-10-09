import { authSession } from '@/helpers/authSession';
import { AsyncStorageKey, asyncStorageService } from "@/helpers/asyncStorageService";
import { profileService } from "@/services/profile";
import { isAxiosError } from "axios";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { ProfileDraft, profileSchema, toProfileDraft, UserProfile } from "../schemas/profileSchema";

type FieldErrors = Partial<Record<keyof ProfileDraft, string>>;
const getToken = async (): Promise<string | null> => {
  const value = await asyncStorageService.getSyncedFromDevice(AsyncStorageKey.ACCESS_TOKEN);
  return typeof value === "string" && value ? value : null;
};

export const useProfileForm = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [unknownOutcome, setUnknownOutcome] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const generation = useRef(0);
  const owner = useRef<string | null>(null);
  const busy = useRef(false);
  const active = useRef(false);

  const load = useCallback(async (preserveDraft = false) => {
    const current = ++generation.current;
    busy.current = true;
    setLoading(true);
    setSaving(false);
    const token = await getToken();
    if (!active.current || current !== generation.current) return;
    const sameAccount = token === owner.current;
    owner.current = token;
    if (!preserveDraft || !sameAccount) {
      setProfile(null);
      setDraft(null);
      setUnknownOutcome(false);
      setReviewed(false);
      setErrors({});
    }
    setMessage("");
    setSignedOut(!token);
    try {
      if (!token) return;
      const result = await profileService.get(token);
      if (!active.current || current !== generation.current) return;
      if (await getToken() !== token) {
        void load();
        return;
      }
      if (!active.current || current !== generation.current) return;
      setProfile(result);
      if (!preserveDraft || !sameAccount) setDraft(toProfileDraft(result));
      else setDraft(previous => previous ?? toProfileDraft(result));
      setReviewed(preserveDraft && sameAccount);
      setUnknownOutcome(false);
      if (preserveDraft && sameAccount) setMessage("Hồ sơ trên máy chủ đã được tải lại. Kiểm tra trước khi lưu tiếp.");
    } catch (error) {
      if (!active.current || current !== generation.current) return;
      if (await getToken() !== token) { void load(); return; }
      if (!active.current || current !== generation.current) return;
      setMessage(isAxiosError(error) && error.response?.status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : "Không tải được hồ sơ. Vui lòng thử lại.");
    } finally {
      if (active.current && current === generation.current) {
        busy.current = false;
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    active.current = true;
    void load();
    const unsubscribe = authSession.subscribe((userId, reason) => {
      if (reason === 'token') {
        void authSession.read().then(session => {
          if (!active.current || !session.accessToken) return;
          owner.current = session.accessToken;
          void load(true);
        });
        return;
      }
      ++generation.current;
      owner.current = null;
      setProfile(null); setDraft(null); setSaving(false); setErrors({});
      if (userId === null) { setLoading(false); setSignedOut(true); }
      else void load();
    });
    const appState = AppState.addEventListener("change", state => {
      if (state === "active") void getToken().then(token => {
        if (active.current && token !== owner.current) void load();
      });
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === AsyncStorageKey.ACCESS_TOKEN || event.key === null) void load();
    };
    if (Platform.OS === "web") window.addEventListener("storage", onStorage);
    return () => {
      active.current = false;
      ++generation.current;
      owner.current = null;
      busy.current = false;
      unsubscribe();
      appState.remove();
      if (Platform.OS === "web") window.removeEventListener("storage", onStorage);
    };
  }, [load]));

  const save = async () => {
    if (busy.current || unknownOutcome || !draft || !owner.current) return;
    const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProfileDraft;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setMessage("");
      return;
    }
    busy.current = true;
    setSaving(true);
    setErrors({});
    setMessage("");
    const token = owner.current;
    const current = generation.current;
    try {
      if (await getToken() !== token) { void load(); return; }
      if (!active.current || current !== generation.current) return;
      const result = await profileService.update(token, parsed.data);
      if (!active.current || current !== generation.current) return;
      if (await getToken() !== token) { void load(); return; }
      if (!active.current || current !== generation.current) return;
      setProfile(result);
      setDraft(toProfileDraft(result));
      setReviewed(false);
      setMessage("Đã lưu hồ sơ.");
    } catch (error) {
      if (!active.current || current !== generation.current) return;
      if (await getToken() !== token) { void load(); return; }
      if (!active.current || current !== generation.current) return;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (!status || status >= 500) {
        setUnknownOutcome(true);
        setMessage("Chưa xác nhận được kết quả lưu. Dữ liệu nhập vẫn được giữ. Tải lại hồ sơ trên máy chủ để kiểm tra trước khi lưu tiếp.");
      } else {
        const serverErrors = isAxiosError(error) ? error.response?.data?.errors : undefined;
        if (serverErrors && typeof serverErrors === "object") {
          const fieldErrors: FieldErrors = {};
          for (const key of ["fullname", "phone", "address", "gender", "class"] as const) {
            const value = serverErrors[key];
            if (typeof value === "string") fieldErrors[key] = value;
            else if (Array.isArray(value)) fieldErrors[key] = value.join("; ");
          }
          setErrors(fieldErrors);
        }
        setMessage(status === 401
          ? "Phiên đăng nhập đã hết hạn. Dữ liệu nhập vẫn được giữ; vui lòng đăng nhập lại."
          : "Không lưu được hồ sơ. Dữ liệu nhập vẫn được giữ.");
      }
    } finally {
      if (active.current && current === generation.current) {
        busy.current = false;
        setSaving(false);
      }
    }
  };
  const change = (key: keyof ProfileDraft, value: string) => {
    setDraft(previous => previous ? { ...previous, [key]: value } : previous);
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setMessage("");
  };
  const cancel = () => {
    if (busy.current || unknownOutcome || !profile) return;
    setDraft(toProfileDraft(profile));
    setReviewed(false);
    setErrors({});
    setMessage("");
  };
  return { profile, draft, reviewed, loading, saving, errors, message, unknownOutcome, signedOut, save, change, cancel,
    reload: () => { if (!busy.current) void load(true); } };
};
