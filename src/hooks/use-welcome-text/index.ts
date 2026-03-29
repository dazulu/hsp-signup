import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useLocale } from "../../i18n";
import type { Locale } from "../../i18n/types";
import type { WelcomeText } from "./types";

const STORAGE_KEY = "app_has_opened_before";

const titles: Record<Locale, string[]> = {
  en: ["Moin", "Hello", "Dia dhuit"],
  ga: ["Dia dhuit", "Conas atá tú"],
  de: ["Moin", "Hallo"],
};

const genericSubtitles: Record<Locale, string[]> = {
  en: [
    "Here's what's been happening in the club.",
    "Everything you need, all in one place.",
    "A quick look at how things are going.",
    "What's new and what's next for you.",
    "One step at a time, one session at a time.",
    "Another day, another chance to show up.",
    "Ready when you are, let's go!",
    "S.M.A.R.T.",
  ],
  ga: [
    "Seo a bhfuil ag tarlú sa chlub.",
    "Gach rud a theastaíonn uait, in aon áit amháin.",
    "Féachaint ghasta ar conas atá rudaí ag dul.",
    "Cad atá nua agus cad atá romhat.",
    "Céim ar chéim, seisiún ar sheisiún.",
    "Lá eile, deis eile a bheith i láthair.",
    "Réidh nuair atá tú féin, ar aghaidh linn!",
    "S.M.A.R.T.",
  ],
  de: [
    "Das passiert gerade im Club.",
    "Alles was du brauchst, an einem Ort.",
    "Ein kurzer Blick auf den aktuellen Stand.",
    "Was es Neues gibt und was als Nächstes kommt.",
    "Schritt für Schritt, Training für Training.",
    "Ein neuer Tag, eine neue Chance dabei zu sein.",
    "Bereit wenn du es bist, los geht's!",
    "S.M.A.R.T.",
  ],
};

const returningSubtitles: Record<Locale, string[]> = {
  en: [
    ...genericSubtitles.en,
    "Good to see you, here's the latest.",
    "Welcome back, let's get you up to speed.",
    "Back again? Must be doing something right.",
    "You know the drill, let's get after it!",
    "Still showing up, that's what counts.",
    "The grind doesn't stop, and neither do you!",
  ],
  ga: [
    ...genericSubtitles.ga,
    "Deas thú a fheiceáil, seo an scéal is déanaí.",
    "Fáilte ar ais, cuirfimid ar an eolas thú.",
    "Ar ais arís? Rud éigin á dhéanamh i gceart!",
    "Is eol duit an scéal, ar aghaidh linn!",
    "Fós ag teacht, sin an rud is tábhachtaí.",
    "Ní stopann an obair, agus ní stopann tusa ach oiread!",
  ],
  de: [
    ...genericSubtitles.de,
    "Schön dich zu sehen, hier ist das Neueste.",
    "Willkommen zurück, hier bist du auf dem Laufenden.",
    "Schon wieder da? Muss wohl richtig laufen.",
    "Du kennst den Ablauf, legen wir los!",
    "Immer noch dabei, das zählt.",
    "Der Grind hört nicht auf, und du auch nicht!",
  ],
};

const pickRandom = (items: string[]) =>
  items[Math.floor(Math.random() * items.length)];

export const useWelcomeText = (): WelcomeText => {
  const { locale } = useLocale();
  const [text, setText] = useState<WelcomeText>({ title: "", subtitle: "" });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        const isReturning = value === "true";
        const pool = isReturning
          ? returningSubtitles[locale]
          : genericSubtitles[locale];
        setText({
          title: pickRandom(titles[locale]),
          subtitle: pickRandom(pool),
        });

        if (!isReturning) {
          AsyncStorage.setItem(STORAGE_KEY, "true");
        }
      })
      .catch(() => {
        setText({
          title: pickRandom(titles[locale]),
          subtitle: pickRandom(genericSubtitles[locale]),
        });
      });
  }, [locale]);

  return text;
};
