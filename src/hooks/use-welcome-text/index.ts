import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { WelcomeText } from "./types";

const STORAGE_KEY = "hsp_has_opened_app_before";

const titles = ["Moin", "Hello", "Dia dhuit"];

const genericSubtitles = [
  "Here's what's been happening in the club.",
  "Everything you need, all in one place.",
  "A quick look at how things are going.",
  "What's new and what's next for you.",
  "One step at a time, one session at a time.",
  "Another day, another chance to show up.",
  "Ready when you are, let's go!",
  "S.M.A.R.T.",
];

const returningSubtitles = [
  ...genericSubtitles,
  "Good to see you, here's the latest.",
  "Welcome back, let's get you up to speed.",
  "Back again? Must be doing something right.",
  "You know the drill, let's get after it!",
  "Still showing up, that's what counts.",
  "The grind doesn't stop, and neither do you!",
];

const pickRandom = (items: string[]) =>
  items[Math.floor(Math.random() * items.length)];

export const useWelcomeText = (): WelcomeText => {
  const [text, setText] = useState<WelcomeText>({ title: "", subtitle: "" });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        const isReturning = value === "true";
        const pool = isReturning ? returningSubtitles : genericSubtitles;
        setText({
          title: pickRandom(titles),
          subtitle: pickRandom(pool),
        });

        if (!isReturning) {
          AsyncStorage.setItem(STORAGE_KEY, "true");
        }
      })
      .catch(() => {
        setText({
          title: pickRandom(titles),
          subtitle: pickRandom(genericSubtitles),
        });
      });
  }, []);

  return text;
};
