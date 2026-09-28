import IconApple from "@/assets/icon/ic_apple";
import IconDevice from "@/assets/icon/ic_device";
import IconFaceBook from "@/assets/icon/ic_facebook";
import IconGoogle from "@/assets/icon/ic_google";
import Item1 from "@/modules/authentication/components/Button";
import { View } from "react-native";
const socialProviders = [
  { icon: <IconGoogle />, name: "google" },
  { icon: <IconFaceBook />, name: "facebook" },
  { icon: <IconApple />, name: "apple" },
  { icon: <IconDevice />, name: "device" },
];
export default function SocialLoginButtons() {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
      }}
    >
      {socialProviders.map(({ icon, name }) => (
        <Item1
          key={name}
          icon={icon}
          onPress={() => console.log(`Login with ${name}`)}
          style={{ flex: 1 }}
        />
      ))}
    </View>
  );
}
