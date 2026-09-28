import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconChatbot1 = (props: SvgProps) => (
  <Svg width={32} height={32} fill="none" {...props}>
    <G fill="#323232" clipPath="url(#a)">
      <Path
        fillRule="evenodd"
        d="M22.227 17.507c1.826 1.24 3.106 2.92 3.106 5.16v4h4c.734 0 1.334-.6 1.334-1.334v-2.666c0-2.907-4.76-4.627-8.44-5.16Z"
        clipRule="evenodd"
      />
      <Path d="M12 16a5.333 5.333 0 1 0 0-10.667A5.333 5.333 0 0 0 12 16Z" />
      <Path
        fillRule="evenodd"
        d="M20 16a5.332 5.332 0 0 0 5.333-5.333A5.332 5.332 0 0 0 20 5.333c-.627 0-1.213.134-1.773.32a7.973 7.973 0 0 1 0 10.027c.56.187 1.146.32 1.773.32ZM12 17.333c-3.56 0-10.667 1.787-10.667 5.334v2.666c0 .734.6 1.334 1.334 1.334h18.666c.734 0 1.334-.6 1.334-1.334v-2.666c0-3.547-7.107-5.334-10.667-5.334Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h32v32H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconChatbot1;
