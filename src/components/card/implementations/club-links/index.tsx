import { View } from "react-native";
import { useLocale } from "../../../../i18n";
import { ExternalLink } from "../../../external-link";
import { Card } from "../../";
import { styles } from "./styles";

const LINKS: Array<{ label: string; href: string }> = [
  {
    label: "O'Neills Merch",
    href: "https://www.oneills.com/int_en/shop-by-team/gaa/europe/hamburg-gaa.html",
  },
  {
    label: "Club Merch",
    href: "https://hamburggaa.myspreadshop.de/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/hamburggaa/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/HamburgGAA/",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/hamburggaa/",
  },
  {
    label: "Foireann",
    href: "https://www.foireann.ie/",
  },
  {
    label: "GAA Europe",
    href: "https://gaelicgameseurope.com/",
  },
  {
    label: "GAA Germany",
    href: "https://www.germangaa.de/clubs",
  },
  {
    label: "Strava Club",
    href: "https://www.strava.com/clubs/1228201",
  },
  {
    label: "Hochschulsport",
    href: "https://www.hochschulsport.uni-hamburg.de/",
  },
];

export const ClubLinksCard = () => {
  const { t } = useLocale();

  return (
    <Card span={2} title={t("card.links.title")} transparent>
      <View style={styles.list}>
        {LINKS.map((link) => (
          <ExternalLink
            key={link.href}
            label={link.label}
            href={link.href}
            style={styles.item}
          />
        ))}
      </View>
    </Card>
  );
};
