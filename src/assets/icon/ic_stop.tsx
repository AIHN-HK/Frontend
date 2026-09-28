import * as React from "react"
import Svg, { SvgProps, G, Path, Defs, ClipPath } from "react-native-svg"
const IconStop = (props: SvgProps) => (
  <Svg

    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#000"
        d="M12 .002C5.382.002.002 5.382.002 12c0 6.619 5.38 11.998 11.998 11.998 6.619 0 11.998-5.38 11.998-11.998C23.998 5.382 18.618.002 12 .002Zm0 1.496A10.492 10.492 0 0 1 22.502 12 10.492 10.492 0 0 1 12 22.502 10.492 10.492 0 0 1 1.498 12 10.492 10.492 0 0 1 12 1.498ZM7.5 7.5h9v9h-9v-9Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)
export default IconStop
