import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import type { TrainingStackParamList } from "../navigation/types";
import { theme } from "../theme";
import { styles } from "./training.styles";

const { space } = theme;

const HSP_MAP_URL = "https://maps.app.goo.gl/g1j5MjNKGKgmeWec6";
const STADTPARK_MAP_URL = "https://maps.app.goo.gl/3CW5MYLVh8MvbdVt5";

const TrainingScrollContent = () => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();
  const navigation =
    useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, []),
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
    >
      <CardGrid>
        {/* Training information card */}
        <Card
          span={2}
          title={t("training.infoCard.title")}
          onPress={() => navigation.navigate("TrainingInfo")}
        >
          <Text style={styles.introText}>{t("training.infoCard.body")}</Text>
        </Card>

        {/* Hochschulsport card */}
        <Card span={2} title="Hochschulsport Hamburg">
          <View style={[styles.sportRow, { marginTop: space[10] }]}>
            <Text style={styles.sportLabel}>
              {t("training.hsp.hurlingLabel")}
            </Text>
            <Text style={styles.sportTime}>
              {t("training.hsp.hurlingTime")}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sportRow}>
            <Text style={styles.sportLabel}>
              {t("training.hsp.footballLabel")}
            </Text>
            <Text style={styles.sportTime}>
              {t("training.hsp.footballTime")}
            </Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL(HSP_MAP_URL)}
            accessibilityRole="link"
          >
            <Image
              source={require("../../assets/map-hsp.png")}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </Pressable>

          <View style={styles.transportRow}>
            <Image
              source={require("../../assets/ubahn.png")}
              style={styles.transportIcon}
              resizeMode="contain"
            />
            <Text style={styles.transportLabel}>Hallerstraße (U1)</Text>
          </View>

          <View style={styles.transportRow}>
            <Image
              source={require("../../assets/bus.png")}
              style={styles.transportIcon}
              resizeMode="contain"
            />
            <Text style={styles.transportLabel}>
              U Hallerstraße / Museum am Rothenbaum
            </Text>
          </View>
        </Card>

        {/* Stadtpark card */}
        <Card span={2} title="Stadtpark">
          <Text style={styles.introText}>{t("training.stadtpark.intro")}</Text>

          <Pressable
            onPress={() => Linking.openURL(STADTPARK_MAP_URL)}
            accessibilityRole="link"
          >
            <Image
              source={require("../../assets/map-stadtpark.png")}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </Pressable>

          <View style={styles.transportRow}>
            <Image
              source={require("../../assets/ubahn.png")}
              style={styles.transportIcon}
              resizeMode="contain"
            />
            <Text style={styles.transportLabel}>
              {t("training.stadtpark.station")}
            </Text>
          </View>
        </Card>
      </CardGrid>

      <Text style={styles.credits}>
        © MapTiler © OpenStreetMap contributors
      </Text>
    </ScrollView>
  );
};

export const TrainingScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("training.title")} subtitle={t("training.subtitle")}>
      <TrainingScrollContent />
    </ScreenLayout>
  );
};
