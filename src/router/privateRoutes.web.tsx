import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import CustomLoadingSpinner from '../components/CustomLoadingSpinner/CustomLoadingSpinner';
import HomeRouter from '../screens/Home';
import { fetchFacilitatorProfile } from '../services/authService';
import { fetchAdministrativeRegions } from '../services/issues/AdministrativeRegionService';
import { logout, setProfile } from '../store/ducks/authentication.duck';
import { setGlobalLoading } from '../store/ducks/global.duck';
import { i18n } from '../translations/i18n';
import { colors } from '../utils/colors';
import { INITIAL_DATA_FETCHED_STORAGE_KEY } from '../utils/constants';
import { getData, storeData } from '../utils/storageManager';

const { width } = Dimensions.get('screen');

const theme = {
  roundness: 12,
  colors: {
    ...colors,
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};

const Stack = createStackNavigator();

/**
 * Web version of PrivateRoutes.
 *
 * Differences from the native version:
 *  - No WatermelonDB `DatabaseProvider` and no offline sync loop — the demo
 *    talks to the remote API directly.
 *  - "Ready" is gated only on the facilitator profile load.
 */
const PrivateRoutes = () => {
  const dispatch = useDispatch();
  const [profileLoaded, setProfileLoaded] = React.useState(false);
  const [profileError, setProfileError] = React.useState<Error | null>(null);
  const { profile } = useSelector((state: any) => state.get('authentication').toObject());

  const fetchConstants = async () => {
    const hasInitialData = await getData(INITIAL_DATA_FETCHED_STORAGE_KEY);

    if (!hasInitialData) {
      try {
        dispatch(setGlobalLoading(true));
        const FETCH_ALL_PAGES = true;
        await fetchAdministrativeRegions(FETCH_ALL_PAGES);
        await storeData(INITIAL_DATA_FETCHED_STORAGE_KEY, true);
        dispatch(setGlobalLoading(false));
      } catch (error) {
        console.error(error);
        dispatch(setGlobalLoading(false));
      }
    }
  };

  const loadFacilitatorProfile = async () => {
    if (profile) {
      setProfileLoaded(true);
      return;
    }

    const facilitatorProfileResponse = await fetchFacilitatorProfile();
    if (facilitatorProfileResponse.error) {
      console.error(facilitatorProfileResponse.error);
      setProfileError(facilitatorProfileResponse.error);
    } else {
      dispatch(setProfile(facilitatorProfileResponse));
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    loadFacilitatorProfile();
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;
    fetchConstants();
  }, [profileLoaded]);

  if (profileError)
    return (
      <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <View />
        <Text
          style={{
            fontSize: 20,
            textAlign: 'center',
            marginVertical: 16,
            marginHorizontal: 14,
            color: colors.primary,
            fontWeight: '600',
          }}
        >
          Something wrong has occurred. Please try again.
        </Text>
        <View>
          <Button
            theme={theme}
            style={[styles.reloadButton, { backgroundColor: '#24c38b' }]}
            color="white"
            onPress={() => {
              setProfileError(null);
              setProfileLoaded(false);
              loadFacilitatorProfile();
            }}
          >
            {i18n.t('reload')}
          </Button>
          <View style={{ marginVertical: 20 }} />
          <Button
            theme={theme}
            style={[styles.reloadButton, { backgroundColor: colors.lightgray }]}
            color="white"
            onPress={() => dispatch(logout())}
          >
            {i18n.t('logout')}
          </Button>
          <View style={{ marginVertical: 20 }} />
          <Text
            style={{
              marginVertical: 16,
              color: colors.error,
              marginHorizontal: 14,
              textAlign: 'center',
            }}
          >
            {profileError.message}
            If the error persists, please contact support.
          </Text>
        </View>
      </View>
    );

  if (!profileLoaded) return <CustomLoadingSpinner />;

  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Main"
        component={HomeRouter}
      />
    </Stack.Navigator>
  );
};

export default PrivateRoutes;

const styles = StyleSheet.create({
  reloadButton: {
    alignSelf: 'center',
    width: width - 60,
    height: 47,
    borderWidth: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    backgroundColor: '#dedede',
  },
});
