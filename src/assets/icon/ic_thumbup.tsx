import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconThumbup = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        stroke="#3E3E3E"
        d="M2.5 8c.64 0 1.166.526 1.166 1.166v6.667c0 .64-.525 1.167-1.166 1.167-.64 0-1.167-.526-1.167-1.167V9.166C1.333 8.526 1.86 8 2.5 8Zm8.79-5.932a.74.74 0 0 1 1.051-.003c.177.178.252.43.202.683l-.79 3.817-.126.601h5.323c1.431 0 2.4 1.466 1.84 2.788l-2.714 6.337c-.189.43-.611.71-1.076.71H7.5c-.64 0-1.167-.527-1.167-1.168V7.508c0-.31.124-.608.337-.821l4.617-4.616.003-.003Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconThumbup;
