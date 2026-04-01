export type YearSidebarProps = {
  years: number[];
  activeYear: number | null;
  onYearPress: (year: number) => void;
};
