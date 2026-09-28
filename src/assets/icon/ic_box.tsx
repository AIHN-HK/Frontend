import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconBox = (props: SvgProps) => (
  <Svg width={13} height={13} fill="none" {...props}>
    <Path
      stroke="#6C7278"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M.75 2.333A1.583 1.583 0 0 1 2.333.75h7.917a1.583 1.583 0 0 1 1.583 1.583v7.917a1.583 1.583 0 0 1-1.583 1.583H2.333A1.583 1.583 0 0 1 .75 10.25V2.333Z"
    />
  </Svg>
);
export default IconBox;
