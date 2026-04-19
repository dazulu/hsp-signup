import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { useLocale } from "../../../../i18n";
import { Card } from "../../";
import { styles } from "./styles";

const DISMISSED_KEY = "app_training_promo_dismissed";

export const TrainingPromoCard = () => {
  const { t } = useLocale();
  const navigation = useNavigation();
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then((value) => {
      setIsDismissed(value === "true");
    });
  }, []);

  const onDismiss = () => {
    setIsDismissed(true);
    AsyncStorage.setItem(DISMISSED_KEY, "true");
  };

  if (isDismissed !== false) {
    return null;
  }

  return (
    <Card
      span={2}
      gradient={["#5a79f8", "#3a55e0"]}
      onPress={() =>
        navigation.dispatch(
          CommonActions.navigate({
            name: "Training",
            params: { screen: "TrainingInfo" },
          }),
        )
      }
    >
      <Text style={styles.heading}>{t("card.trainingPromo.heading")}</Text>
      <Text style={styles.body}>{t("card.trainingPromo.body")}</Text>
      <Pressable
        style={styles.dismissButton}
        onPress={onDismiss}
        hitSlop={8}
        accessibilityRole="button"
      >
        <Text style={styles.dismissText}>
          {t("card.trainingPromo.dismiss")}
        </Text>
      </Pressable>
    </Card>
  );
};
