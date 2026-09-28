import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconDevice = (props: SvgProps) => (
  <Svg width={18} height={18} fill="none" {...props}>
    <Path
      stroke="#04070E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.25 3h1.5M9 12.75v.008M4.5 3.75A1.5 1.5 0 0 1 6 2.25h6a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V3.75Z"
    />
  </Svg>
);
export default IconDevice;
