import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconCalendar = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Path
      stroke="#ACB5BB"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.3}
      d="M10.667 2v2.667M5.333 2v2.667M2.667 7.333h10.666M2.667 4.667A1.333 1.333 0 0 1 4 3.333h8a1.333 1.333 0 0 1 1.333 1.334v8A1.333 1.333 0 0 1 12 14H4a1.333 1.333 0 0 1-1.333-1.333v-8Zm4.666 6a.667.667 0 1 0 1.334 0 .667.667 0 0 0-1.334 0Z"
    />
  </Svg>
);
export default IconCalendar;
