import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ZodType } from "zod";
import { useHttpClient } from "@/shared/api/api-context";
import { ApiError } from "@/shared/api/api-error";
import { session, useSession } from "@/shared/session/session";

export function usePlatformQuery<T>(
  key: string,
  url: string,
  schema: ZodType<T>,
  personal = false,
  enabled = true,
) {
  const http = useHttpClient(),
    current = useSession();
  return useQuery({
    queryKey: [
      "career-platform",
      personal ? current.user?.id : 0,
      current.revision,
      key,
      url,
    ],
    enabled: enabled && (!personal || current.status === "authenticated"),
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await http.get<unknown>(url, { signal });
      if (
        !response.data ||
        typeof response.data !== "object" ||
        !("data" in response.data)
      )
        throw new ApiError("configuration", "Dữ liệu nghề chưa hợp lệ.");
      const parsed = schema.safeParse(response.data.data);
      if (!parsed.success)
        throw new ApiError("configuration", "Dữ liệu nghề chưa hợp lệ.");
      return parsed.data;
    },
  });
}
export function usePlatformCommand() {
  const http = useHttpClient(),
    queryClient = useQueryClient(),
    current = useSession();
  const controller = useRef<AbortController | null>(null),
    locked = useRef(false);
  const scope = `${current.user?.id}:${current.revision}`;
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [scope],
  );
  return useMutation({
    retry: false,
    mutationKey: ["career-platform", "command", scope],
    mutationFn: async (input: {
      method: "post" | "put" | "patch";
      url: string;
      body: unknown;
      schema: ZodType<unknown>;
    }) => {
      if (locked.current)
        throw new ApiError("configuration", "Đang xử lý yêu cầu.");
      const before = session.read();
      if (
        before.status !== "authenticated" ||
        !before.user ||
        `${before.user?.id}:${before.revision}` !== scope
      )
        throw new ApiError("session-changed", "Phiên đã thay đổi.");
      locked.current = true;
      controller.current = new AbortController();
      try {
        const response = await http.request<unknown>({
          method: input.method,
          url: input.url,
          data: input.body,
          signal: controller.current.signal,
        });
        const after = session.read();
        if (
          after.revision !== before.revision ||
          after.user?.id !== before.user?.id
        )
          throw new ApiError("session-changed", "Phiên đã thay đổi.");
        const envelope = response.data as { data?: unknown };
        const parsed = input.schema.safeParse(envelope?.data);
        if (!parsed.success)
          throw new ApiError(
            "configuration",
            "Chưa xác nhận dữ liệu đã lưu.",
            undefined,
            true,
          );
        if (
          parsed.data &&
          typeof parsed.data === "object" &&
          "userId" in parsed.data &&
          parsed.data.userId !== before.user.id
        )
          throw new ApiError(
            "configuration",
            "Phản hồi không thuộc tài khoản hiện tại.",
            undefined,
            true,
          );
        return parsed.data;
      } finally {
        locked.current = false;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["career-platform"] });
    },
  });
}
