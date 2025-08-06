import {
  MastersHero,
  MastersHeaderCard,
  MastersTravelCard,
  MastersPlayerCard,
  MastersPrizeCard,
  MastersContestRules,
  MastersFooter,
} from "@/components/themes/masters";

import {
  DefaultHero,
  DefaultHeaderCard,
  DefaultTravelCard,
  DefaultPlayerCard,
  DefaultPrizeCard,
  DefaultContestRules,
  DefaultFooter,
} from "@/components/themes/default";

import {
  TourTechHero,
  TourTechHeaderCard,
  TourTechTravelCard,
  TourTechPlayerCard,
  TourTechPrizeCard,
  TourTechContestRules,
  TourTechFooter,
} from "@/components/themes/tourtech";

export const themeComponents = {
  Masters: {
    Hero: MastersHero,
    HeaderCard: MastersHeaderCard,
    TravelCard: MastersTravelCard,
    PlayerCard: MastersPlayerCard,
    PrizeCard: MastersPrizeCard,
    ContestRules: MastersContestRules,
    Footer: MastersFooter,
  },
  TourTech: {
    Hero: TourTechHero,
    HeaderCard: TourTechHeaderCard,
    TravelCard: TourTechTravelCard,
    PlayerCard: TourTechPlayerCard,
    PrizeCard: TourTechPrizeCard,
    ContestRules: TourTechContestRules,
    Footer: TourTechFooter,
  },
  GolfOS: {
    Hero: DefaultHero,
    HeaderCard: DefaultHeaderCard,
    TravelCard: DefaultTravelCard,
    PlayerCard: DefaultPlayerCard,
    PrizeCard: DefaultPrizeCard,
    ContestRules: DefaultContestRules,
    Footer: DefaultFooter,
  },
  default: {
    Hero: DefaultHero,
    HeaderCard: DefaultHeaderCard,
    TravelCard: DefaultTravelCard,
    PlayerCard: DefaultPlayerCard,
    PrizeCard: DefaultPrizeCard,
    ContestRules: DefaultContestRules,
    Footer: DefaultFooter,
  },
};

export type ThemeName = keyof typeof themeComponents;
export type ThemeComponentType = keyof typeof themeComponents.default;
