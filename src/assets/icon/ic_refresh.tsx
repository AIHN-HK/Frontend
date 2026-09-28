import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const IconRefresh = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      stroke="#33363F"
      strokeWidth={2}
      d="m11.083 11.875-3.166 3.167 3.166 3.166"
    />
    <Path
      stroke="#33363F"
      strokeLinecap="round"
      strokeWidth={2}
      d="M4.7 12.27a5.542 5.542 0 1 1 4.8 2.772"
    />
  </Svg>
);
export default IconRefresh;
