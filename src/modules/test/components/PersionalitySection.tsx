import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { Text, View } from "react-native";
import Description from "./Description";
import Line from "./Line";
type Props = {
  title: string;
  backgroundColor: string;
  data?: string | string[];
};

const PersonalitySection = ({ title, backgroundColor, data = [] }: Props) => (
  <View>
    <Line />
    <View style={{ marginVertical: 5 }}>
      <View style={{ marginTop: 15, marginBottom: 10 }}>
        <View
          style={{
            backgroundColor: backgroundColor,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: COLORS.colortext1,
              ...TYPOGRAPHY.C4,
              fontWeight: "500",
            }}
          >
            {title}
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {(Array.isArray(data) ? data : data ? [data] : []).map(
          (item: string, index) => (
            <Description key={index} title={item} />
          ),
        )}
      </View>
    </View>
  </View>
);

export default PersonalitySection;
