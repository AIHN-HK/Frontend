import IconBackLeft from "@/assets/icon/ic_backleft";
import IconList from "@/assets/icon/ic_list";
import IconSend from "@/assets/icon/ic_send";
import IconStop from "@/assets/icon/ic_stop";

import Header1 from "@/components/Header1";
import ExitModal from "@/modules/chat/components/exitmodal";
import HistoryModal from "@/modules/chat/components/historymodal";
import { MessageItem } from "@/modules/chat/components/mesage2";

import { useChatbot2 } from "@/modules/chat/hooks/useChatbot2";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const ChatbotScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    messages,
    inputText,
    setInputText,
    isConnected,
    sessionId,
    connectionError,
    flatListRef,
    sendMessage,
    stopGeneration,
    canStop,
    isSending,
    handleRetry,
  } = useChatbot2();

  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [exitModalVisible, setExitModalVisible] = React.useState(false);
  const handleHistory = () => setDetailModalVisible(true);
  const hanldeBack = () => setExitModalVisible(true);

  const isWeb = useIsDesktopWeb();

  const spacing = {
    topSectionPaddingHorizontal: isWeb ? 760 : 24,
    headerPaddingTop: isWeb ? 24 : topPadding,
    chatPaddingHorizontal: isWeb ? 60 : 24,
    chatPaddingBottom: isWeb ? 160 : 100,
    inputWrapperPaddingHorizontal: isWeb ? 60 : 24,
    inputWrapperPaddingVertical: isWeb ? 24 : 12,
    inputPaddingVertical: isWeb ? 16 : 8,
    inputPaddingHorizontal: isWeb ? 24 : 16,
    inputBorderRadius: isWeb ? 16 : 10,
    inputMaxHeight: isWeb ? 160 : 120,
    sendButtonPaddingRight: isWeb ? 32 : 20,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        <View
          style={{
            paddingHorizontal: spacing.topSectionPaddingHorizontal,
            paddingTop: spacing.headerPaddingTop,
          }}
        >
          <Header1
            title="Hỏi đáp cùng chuyên gia"
            iconLeft={<IconBackLeft />}
            iconRight={<IconList />}
            onClickLeft={hanldeBack}
            onClickRight={handleHistory}
            fontWeight="400"
          />
        </View>
      </View>

      <View style={styles.bottomSection}>
        {connectionError && (
          <View style={styles.connectionErrorBanner}>
            <Text style={styles.errorBannerText}>
              Lỗi kết nối: {connectionError}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => {
              var previousUserMessage =
                messages
                  .slice(0, index)
                  .reverse()
                  .find((msg) => msg.isMe && msg.text?.trim())
                  ?.text?.trim() ?? undefined;

              return (
                <MessageItem
                  item={item}
                  previousUserMessage={previousUserMessage}
                  onRetry={(retryText) => {
                    if (retryText && retryText.trim()) {
                      sendMessage(retryText);
                    } else {
                    }
                  }}
                />
              );
            }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: spacing.chatPaddingBottom,
              paddingHorizontal: spacing.chatPaddingHorizontal,
            }}
          />
        </View>

        <View
          style={[
            styles.inputWrapper,
            {
              paddingHorizontal: spacing.inputWrapperPaddingHorizontal,
              paddingVertical: spacing.inputWrapperPaddingVertical,
            },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              (!isConnected || connectionError) && styles.inputDisabled,
              {
                paddingVertical: spacing.inputPaddingVertical,
                borderRadius: spacing.inputBorderRadius,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  paddingHorizontal: spacing.inputPaddingHorizontal,
                  maxHeight: spacing.inputMaxHeight,
                },
              ]}
              placeholder="Gửi tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={isConnected && !connectionError && !canStop}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { paddingRight: spacing.sendButtonPaddingRight },
              ]}
              onPress={() => {
                if (canStop) {
                  stopGeneration();
                } else if (inputText.trim()) {
                  sendMessage(inputText.trim());
                }
              }}
              disabled={
                (!inputText.trim() && !canStop) ||
                !isConnected ||
                !sessionId ||
                !!connectionError
              }
            >
              {canStop ? (
                <IconStop />
              ) : (
                <IconSend
                  opacity={
                    !isConnected || connectionError || isSending ? 0.4 : 1
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ExitModal
        visible={exitModalVisible}
        onRetry={() => setExitModalVisible(false)}
        onClose={() => {
          router.push("/(tabs)/chatbot");
          setExitModalVisible(false);
        }}
        description={"Kết thúc tư vấn?"}
      />
      <HistoryModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  topSection: { backgroundColor: COLORS.white },
  bottomSection: { flex: 1, backgroundColor: COLORS.basegrey },

  chatContainer: {
    flex: 1,
    position: "relative",
  },

  inputWrapper: {
    backgroundColor: COLORS.basegrey,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey3,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  inputDisabled: { backgroundColor: COLORS.basegrey },
  connectionErrorBanner: {
    backgroundColor: "#ffebee",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ef9a9a",
  },
  errorBannerText: {
    color: "#c62828",
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#c62828",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
