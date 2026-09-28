import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconErrorInput = (props: SvgProps) => (
  <Svg width={13} height={13} fill="none" {...props}>
    <Path
      fill="#EA4335"
      d="M6.5 0A6.502 6.502 0 0 0 0 6.5C0 10.088 2.912 13 6.5 13S13 10.088 13 6.5 10.088 0 6.5 0Zm.65 9.75h-1.3v-1.3h1.3v1.3Zm0-2.6h-1.3v-3.9h1.3v3.9Z"
    />
  </Svg>
);
export default IconErrorInput;
