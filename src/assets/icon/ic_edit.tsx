import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const IconEdit = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      stroke="#3E3E3E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 2H8C4 2 2 4 2 8v8c0 4 2 6 6 6h8c4 0 6-2 6-6V8c0-4-2-6-6-6Z"
    />
    <Path
      stroke="#3E3E3E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="m12.91 7.84-5.19 5.19c-.2.2-.39.59-.43.87l-.28 1.98c-.1.72.4 1.22 1.12 1.12l1.98-.28c.28-.04.67-.23.87-.43l5.19-5.19c.89-.89 1.32-1.93 0-3.25-1.32-1.33-2.36-.91-3.26-.01Z"
    />
    <Path
      stroke="#3E3E3E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M12.17 8.58a4.688 4.688 0 0 0 3.25 3.25"
    />
  </Svg>
);
export default IconEdit;
