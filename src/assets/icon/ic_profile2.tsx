import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconProfile2 = (props: SvgProps) => (
  <Svg width={32} height={32} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M16 2.667C8.64 2.667 2.667 8.64 2.667 16S8.64 29.333 16 29.333 29.333 23.36 29.333 16 23.36 2.667 16 2.667Zm0 4c2.213 0 4 1.786 4 4 0 2.213-1.787 4-4 4s-4-1.787-4-4c0-2.214 1.787-4 4-4ZM16 25.6a9.6 9.6 0 0 1-8-4.293c.04-2.654 5.333-4.107 8-4.107 2.653 0 7.96 1.453 8 4.107a9.6 9.6 0 0 1-8 4.293Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h32v32H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconProfile2;
