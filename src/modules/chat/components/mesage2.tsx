import IconCopy from "@/assets/icon/ic_copy";
import IconDownload from "@/assets/icon/ic_download";
import { COLORS } from "@/utilities/colors";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Message } from "../hooks/useChatbot2";

export const MessageItem = ({
  item,
  previousUserMessage,
  onRetry,
}: {
  item: Message;
  previousUserMessage?: string;
  onRetry?: (text: string) => void;
}) => {
  const isAI = !item.isMe;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!text?.trim()) return;
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.log("Copy failed", err);
    }
  };

  const exportSingleMessage = async () => {
    if (!item.text?.trim()) return;
    const sender = isAI ? "AI" : "Bạn";
    const content = `${sender}: ${item.text}\n\nThời gian: ${new Date().toLocaleString("vi-VN")}`;
    const fileName = `message_${Date.now()}.txt`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (!(await Sharing.isAvailableAsync())) {
        alert("Thiết bị không hỗ trợ chia sẻ file");
        return;
      }
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Xuất tin nhắn",
        mimeType: "text/plain",
      });
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (err) {
      console.log("Export failed", err);
      alert("Không thể xuất file");
    }
  };

  return (
    <View style={{ marginBottom: 10 }}>
      {isAI && (
        <>
          {item.status === "sending" && (
            <View style={styles.thinkingContainer}>
              <Text style={styles.statusText}>AI đang suy nghĩ</Text>
              <ActivityIndicator
                size="small"
                color={COLORS.black}
                style={styles.indicator}
              />
            </View>
          )}
          {item.status === "streaming" && (
            <View style={styles.thinkingContainer}>
              <Text style={styles.statusText}>AI đang trả lời...</Text>
              <ActivityIndicator
                size="small"
                color={COLORS.black}
                style={styles.indicator}
              />
            </View>
          )}
          {item.status === "error" && (
            <Text style={styles.errorText}>
              {item.errorMessage || "AI gặp lỗi"}
            </Text>
          )}
          {item.text?.length > 0 && (
            <View style={styles.messageContainer}>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.text}>{item.text}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                  marginLeft: 8,
                  flexWrap: "wrap",
                  gap: 7,
                }}
              >
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.text)}
                  activeOpacity={0.6}
                  disabled={copied}
                >
                  {copied ? (
                    <Text style={styles.statusText}>Đã sao chép</Text>
                  ) : (
                    <IconCopy />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={exportSingleMessage}
                  activeOpacity={0.7}
                >
                  <IconDownload />
                </TouchableOpacity>

                {/* {previousUserMessage && onRetry && (
                  <TouchableOpacity
                    onPress={() => {
                      onRetry(previousUserMessage);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconRefresh />
                  </TouchableOpacity>
                )} */}
              </View>
            </View>
          )}
        </>
      )}

      {!isAI && (
        <View style={styles.messageContainer2}>
          <View style={[styles.bubble, styles.userBubble]}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  thinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.black,
    marginRight: 8,
    paddingBottom: 5,
  },
  indicator: {},
  errorText: {
    fontSize: 12,
    color: "red",
    marginBottom: 4,
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  messageContainer2: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
  },
  aiBubble: {
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: COLORS.purple1,
    alignSelf: "flex-end",
  },
  text: {
    fontSize: 15,
    color: COLORS.black,
  },
});
