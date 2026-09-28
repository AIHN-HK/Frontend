import RenderItem2 from "@/modules/test/components/Item2";
import { ResultItem } from "@/modules/test/utilities";
import { COLORS } from "@/utilities/colors";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  results: ResultItem[];
  isLoading: boolean;
  sessionId?: string;
}

export const ResultListSection = ({ results, isLoading, sessionId }: Props) => {
  const router = useRouter();
  if (isLoading) {
    return <Text style={styles.loadingText}>Đang tải kết quả...</Text>;
  }
  if (results.length === 0) {
    return <Text style={styles.noDataText}>Chưa có nhóm ngành phù hợp</Text>;
  }
  return (
    <View style={styles.listContainer}>
      {results.map((item, index) => (
        <TouchableOpacity
          key={item.code || index}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/home/test/result",
              params: {
                sessionId,
                initialIndex: index.toString(),
                results: JSON.stringify(results),
              },
            })
          }
        >
          <RenderItem2 item={item} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  loadingText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 15,
    marginTop: 20,
  },
  noDataText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 15,
    marginTop: 16,
    paddingVertical: 20,
  },
});
