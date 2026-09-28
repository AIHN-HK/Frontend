import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconHome2 = (props: SvgProps) => (
  <Svg width={32} height={32} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M13.333 25.333v-6.666h5.334v6.666c0 .734.6 1.334 1.333 1.334h4c.733 0 1.333-.6 1.333-1.334V16H27.6c.613 0 .907-.76.44-1.16L16.893 4.8a1.344 1.344 0 0 0-1.786 0L3.96 14.84c-.453.4-.173 1.16.44 1.16h2.267v9.333c0 .734.6 1.334 1.333 1.334h4c.733 0 1.333-.6 1.333-1.334Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h32v32H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconHome2;
