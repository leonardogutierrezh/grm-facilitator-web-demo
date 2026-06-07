import 'react-native-get-random-values';

// Must run before any screen module loads so Dimensions is pinned to phone size
// on desktop web (no-op on native and on phone-sized viewports).
import './src/web/patchDimensions';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
