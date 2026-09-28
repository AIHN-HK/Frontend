import * as React from "react";
import Svg, { Defs, G, Path, Rect, SvgProps } from "react-native-svg";

const IconChecked = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <G filter="url(#a)">
      <Rect width={24} height={24} x={7} y={7} fill="#6C7278" rx={6} />
      <Rect width={23} height={23} x={7.5} y={7.5} stroke="#6C7278" rx={5.5} />
      <Path
        fill="#fff"
        d="M25.866 15.342a.938.938 0 0 0-1.442-1.183l-7.691 7.644-3.157-3.136a.937.937 0 1 0-1.322 1.33l3.818 3.793a.938.938 0 0 0 1.322 0l8.352-8.302a.941.941 0 0 0 .12-.146Z"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default IconChecked;
