import * as React from "react";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from "react-native-svg";
const IconFaceBook = (props: SvgProps) => (
  <Svg width={18} height={18} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="url(#b)"
        d="M7.515 17.91C3.24 17.145 0 13.455 0 9c0-4.95 4.05-9 9-9s9 4.05 9 9c0 4.455-3.24 8.145-7.515 8.91l-.495-.405H8.01l-.495.405Z"
      />
      <Path
        fill="#fff"
        d="M12.51 11.52 12.915 9H10.53V7.245c0-.72.27-1.26 1.35-1.26h1.17V3.69c-.63-.09-1.35-.18-1.98-.18-2.07 0-3.51 1.26-3.51 3.51V9H5.31v2.52h2.25v6.345a8.286 8.286 0 0 0 2.97 0V11.52h1.98Z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={9}
        x2={9}
        y1={17.374}
        y2={-0.003}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#0062E0" />
        <Stop offset={1} stopColor="#19AFFF" />
      </LinearGradient>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconFaceBook;
