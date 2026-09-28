import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconHistory2 = (props: SvgProps) => (
  <Svg width={32} height={32} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M17.68 4C10.893 3.813 5.333 9.267 5.333 16H2.947c-.6 0-.894.72-.467 1.133l3.72 3.734a.66.66 0 0 0 .947 0l3.72-3.734c.413-.413.12-1.133-.48-1.133H8c0-5.2 4.24-9.4 9.466-9.333 4.96.066 9.134 4.24 9.2 9.2.067 5.213-4.133 9.466-9.333 9.466a9.194 9.194 0 0 1-5.706-1.973 1.326 1.326 0 0 0-1.76.107c-.56.56-.52 1.506.106 1.986A11.81 11.81 0 0 0 17.333 28c6.734 0 12.187-5.56 12-12.347C29.16 9.4 23.933 4.173 17.68 4ZM17 10.667c-.547 0-1 .453-1 1v4.906c0 .467.253.907.653 1.147l4.16 2.467c.48.28 1.094.12 1.373-.347a1.01 1.01 0 0 0-.346-1.373L18 16.187v-4.534c0-.533-.453-.986-1-.986Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h32v32H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconHistory2;
