import { screenWidth } from "@/utilities";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MessengerItem = (props: any) => {
  const { onPress } = props;
  const { url, isSender, messenger, timestamp, showUrl } = props.item;

  console.log(url);
  return isSender == false ? (
    <TouchableOpacity onPress={onPress} style={styles.container_sender}>
      {showUrl == true ? (
        <Image source={url} style={styles.image} />
      ) : (
        <View style={styles.not_imageSender} />
      )}
      <View style={styles.view_messageSender}>
        <Text style={styles.send_text_message}>{messenger}</Text>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={onPress} style={styles.container_notIsSender}>
      <View style={styles.view_messageReceive}>
        <View style={styles.adjust_box}></View>
        <Text style={styles.text_message}>{messenger}</Text>
      </View>
      {showUrl == true ? (
        <Image source={url} style={styles.image} />
      ) : (
        <View style={styles.not_imageRecieve} />
      )}
    </TouchableOpacity>
  );
};

export default MessengerItem;

const styles = StyleSheet.create({
  container_sender: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  container_notIsSender: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  view_messageSender: {
    maxWidth: screenWidth * 0.5,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
  },
  view_messageReceive: {
    maxWidth: screenWidth * 0.5,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#7A5AF8",
    borderRadius: 10,
  },
  adjust_box: { width: 40 },
  not_imageSender: { width: 50, height: 50, marginRight: 15, marginStart: 10 },
  not_imageRecieve: { width: 50, height: 50 },
  text_message: {
    alignItems: "center",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  send_text_message: {
    alignItems: "center",
    color: "black",
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "cover",
    borderRadius: 25,
    marginRight: 15,
    marginStart: 10,
  },
});
