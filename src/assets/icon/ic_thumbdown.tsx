import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconThumbdown = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        stroke="#3E3E3E"
        d="M5 3h7.492c.64 0 1.166.527 1.166 1.167v8.324c0 .272-.094.534-.26.739l-.077.083-4.608 4.617-.003.003a.738.738 0 0 1-.993.053l-.058-.05a.757.757 0 0 1-.202-.688h-.001l.792-3.813.125-.602H3.05a1.996 1.996 0 0 1-1.832-2.786l2.716-6.342h.001C4.115 3.28 4.535 3 5 3Zm12.5 0c.64 0 1.167.526 1.167 1.167v6.666c0 .64-.527 1.167-1.167 1.167s-1.167-.527-1.167-1.167V4.167c0-.64.526-1.167 1.167-1.167Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconThumbdown;
