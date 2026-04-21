export type SectionKey = "history" | "rules" | "equipment" | "drills";

export type AnchorNavProps = {
  sections: SectionKey[];
  activeSection?: SectionKey;
  onPress: (section: SectionKey) => void;
};
