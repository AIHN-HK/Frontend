import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconHide = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Path
      stroke="#A9A9A9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.3}
      d="M7.057 7.058a1.333 1.333 0 0 0 1.886 1.885m2.178 2.172A5.811 5.811 0 0 1 8 12c-2.4 0-4.4-1.333-6-4 .848-1.413 1.808-2.452 2.88-3.116m1.907-.764C7.186 4.04 7.593 3.999 8 4c2.4 0 4.4 1.333 6 4-.444.74-.92 1.378-1.425 1.913M2 2l12 12"
    />
  </Svg>
);
export default IconHide;
