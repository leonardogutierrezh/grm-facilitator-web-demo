/**
 * Web replacement for `react-native-collapsible`.
 *
 * The real library animates height using an absolutely-positioned "ghost" view
 * to measure content. On react-native-web that ghost leaks through and overlaps
 * surrounding content. For the demo we don't need the animation — just show the
 * content when expanded and render nothing when collapsed.
 */
import React from "react";
import { View } from "react-native";

export default function Collapsible({ collapsed, children, style }) {
  if (collapsed) return null;
  return <View style={style}>{children}</View>;
}
