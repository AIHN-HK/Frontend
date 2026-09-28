import * as React from "react";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";
const IconCheckedBox = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Rect width={15} height={15} x={0.5} y={0.5} fill="#f0f0f0" rx={3.5} />
    <Rect width={15} height={15} x={0.5} y={0.5} stroke="#0d0b15" rx={3.5} />
    <Path
      stroke="#0d0b15"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      d="m12 5-5.5 5.5L4 8"
    />
  </Svg>
);
export default IconCheckedBox;
