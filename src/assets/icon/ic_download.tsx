import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";
const IconDownload = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="#3E3E3E"
        d="M13.279 8.235h-1.136v-3.53A.712.712 0 0 0 11.429 4H8.57a.712.712 0 0 0-.714.706v3.53H6.721c-.635 0-.957.762-.507 1.206l3.279 3.24a.717.717 0 0 0 1.007 0l3.279-3.24a.705.705 0 0 0-.5-1.207ZM5 15.295c0 .387.321.705.714.705h8.572a.712.712 0 0 0 .714-.706.712.712 0 0 0-.714-.706H5.714a.712.712 0 0 0-.714.706Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default IconDownload;
