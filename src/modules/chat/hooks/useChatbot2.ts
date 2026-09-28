import {
  AsyncStorageKey,
  asyncStorageService,
} from "@/helpers/asyncStorageService";
import { SOCKET_URL } from "@/utilities/appInfo";
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { io, Socket } from "socket.io-client";

export type Message = {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: number;
  status?: "sending" | "streaming" | "complete" | "error";
  errorMessage?: string;
};

export const useChatbot2 = () => {
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const currentAIMessageIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Xin chào! 👋 Tôi là trợ lý AI của bạn. Bạn có thể hỏi tôi bất cứ điều gì.",
      isMe: false,
      timestamp: Date.now(),
      status: "complete",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [canStop, setCanStop] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    let mounted = true;
    const initSocket = async () => {
      try {
        const token = await asyncStorageService.getSyncedFromDevice(
          AsyncStorageKey.ACCESS_TOKEN,
        );
        if (!mounted) return;
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
          forceNew: true,
        });
        socketRef.current = socket;
        socket.on("connect", () => {
          setIsConnected(true);
          setConnectionError(null);
        });

        socket.on("connected", (data: { sessionId: number }) => {
          console.log(" CONNECTED:", data.sessionId);
          sessionIdRef.current = data.sessionId;
          setSessionId(String(data.sessionId));
        });
        socket.on(
          "answer_token",
          (data: { sessionId: number; content: string }) => {
            if (!data.content) return;
            const aiMsgId = currentAIMessageIdRef.current;
            if (!aiMsgId) return;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      text: msg.text + data.content,
                      status: "streaming",
                    }
                  : msg,
              ),
            );
            scrollToBottom();
          },
        );
        socket.on("answer_end", (data: { sessionId: number }) => {
          if (data.sessionId !== sessionIdRef.current) {
            console.warn("⚠️ sessionId không khớp");
            return;
          }
          const aiMsgId = currentAIMessageIdRef.current;
          if (!aiMsgId) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, status: "complete" } : msg,
            ),
          );
          setIsSending(false);
          setCanStop(false);
          currentAIMessageIdRef.current = null;
          scrollToBottom();
        });
        socket.on("generation_stopped", (data: { sessionId: number }) => {
          if (data.sessionId !== sessionIdRef.current) return;
          const aiMsgId = currentAIMessageIdRef.current;
          if (!aiMsgId) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, status: "complete" } : msg,
            ),
          );
          setIsSending(false);
          setCanStop(false);
          currentAIMessageIdRef.current = null;
        });

        socket.on("error", (data: { message?: string }) => {
          const aiMsgId = currentAIMessageIdRef.current;
          if (!aiMsgId) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    status: "error",
                    errorMessage:
                      "❌ " + (data.message || "AI gặp lỗi. Vui lòng thử lại."),
                  }
                : msg,
            ),
          );
          setIsSending(false);
          setCanStop(false);
          currentAIMessageIdRef.current = null;
        });
        socket.on("disconnect", () => {
          setIsConnected(false);
          setConnectionError("Mất kết nối tới máy chủ.");
        });
      } catch (e) {
        setConnectionError("Không thể kết nối server.");
      }
    };
    initSocket();
    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (text: string) => {
    if (
      !text.trim() ||
      !socketRef.current?.connected ||
      !sessionIdRef.current ||
      isSending
    )
      return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isMe: true,
      timestamp: Date.now(),
      status: "complete",
    };

    const aiMsgId = "ai-" + Date.now();
    const aiMsg: Message = {
      id: aiMsgId,
      text: "",
      isMe: false,
      timestamp: Date.now(),
      status: "sending",
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    currentAIMessageIdRef.current = aiMsgId;
    setIsSending(true);
    setCanStop(true);
    setInputText("");
    socketRef.current.emit("ask", {
      sessionId: sessionIdRef.current,
      content: text.trim(),
      basic_info: null,
      profile_json: null,
    });

    scrollToBottom();
  };

  const stopGeneration = () => {
    if (!socketRef.current || !sessionIdRef.current) return;
    socketRef.current.emit("stop_generation", {
      sessionId: sessionIdRef.current,
    });
    setCanStop(false);
  };

  const handleRetry = () => {
    socketRef.current?.connect();
  };

  return {
    messages,
    inputText,
    setInputText,
    isSending,
    canStop,
    isConnected,
    sessionId,
    connectionError,
    flatListRef,
    sendMessage,
    stopGeneration,
    handleRetry,
    scrollToBottom,
  };
};
