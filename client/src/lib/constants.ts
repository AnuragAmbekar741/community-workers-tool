export const GENDER = ["female", "male", "prefer_not_to_say"] as const;
export const ORGANISATION = ["BONEPWA", "MAHALAYPEE"] as const;
export const WORKER_ROLE = ["CDO", "SW", "CHW", "other"] as const;
export const EDUCATION = [
  "none",
  "primary",
  "junior_sec",
  "senior_sec",
  "vocational",
  "diploma",
  "bachelors",
  "postgrad",
] as const;
export const DISTRICT = [
  "gaborone",
  "francistown",
  "lobatse",
  "selibe_phikwe",
  "orapa",
  "jwaneng",
  "sowa_town",
  "kanye_moshupa",
  "barolong",
  "ngwaketse_west",
  "south_east",
  "kweneng_east",
  "kweneng_west",
  "kgatleng",
  "serowe_palapye",
  "central_mahalapye",
  "central_bobonong",
  "central_boteti",
  "central_tutume",
  "north_east",
  "ngamiland_east",
  "ngamiland_west",
  "chobe",
  "delta",
  "ghanzi",
  "central_kalahari_game_reserve",
  "kgalagadi_south",
  "kgalagadi_north",
] as const;
export const VILLAGE = [
  "village_a",
  "village_b",
  "village_c",
  "village_d",
  "village_e",
] as const;
export const TOPIC = [
  "adolescence_youth_risk",
  "puberty_body_changes",
  "srh",
  "relationships_gender_norms",
  "consent_gbv",
  "safeguarding_reporting",
  "other",
] as const;

export type Gender = (typeof GENDER)[number];
export type Organisation = (typeof ORGANISATION)[number];
export type WorkerRole = (typeof WORKER_ROLE)[number];
export type Education = (typeof EDUCATION)[number];
export type District = (typeof DISTRICT)[number];
export type Village = (typeof VILLAGE)[number];
export type Topic = (typeof TOPIC)[number];

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const satisfies ReadonlyArray<{ value: Gender; label: string }>;

export const ORGANISATION_OPTIONS = [
  { value: "BONEPWA", label: "BONEPWA" },
  { value: "MAHALAYPEE", label: "MAHALAYPEE" },
] as const satisfies ReadonlyArray<{ value: Organisation; label: string }>;

export const WORKER_ROLE_OPTIONS = [
  { value: "CDO", label: "CDO" },
  { value: "SW", label: "SW" },
  { value: "CHW", label: "CHW" },
  { value: "other", label: "Other" },
] as const satisfies ReadonlyArray<{ value: WorkerRole; label: string }>;

export const EDUCATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "primary", label: "Primary" },
  { value: "junior_sec", label: "Junior secondary" },
  { value: "senior_sec", label: "Senior secondary" },
  { value: "vocational", label: "Vocational" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "postgrad", label: "Postgraduate" },
] as const satisfies ReadonlyArray<{ value: Education; label: string }>;

export const DISTRICT_OPTIONS = [
  { value: "gaborone", label: "Gaborone" },
  { value: "francistown", label: "Francistown" },
  { value: "lobatse", label: "Lobatse" },
  { value: "selibe_phikwe", label: "Selibe Phikwe" },
  { value: "orapa", label: "Orapa" },
  { value: "jwaneng", label: "Jwaneng" },
  { value: "sowa_town", label: "Sowa Town" },
  { value: "kanye_moshupa", label: "Kanye/Moshupa" },
  { value: "barolong", label: "Barolong" },
  { value: "ngwaketse_west", label: "Ngwaketse West" },
  { value: "south_east", label: "South East" },
  { value: "kweneng_east", label: "Kweneng East" },
  { value: "kweneng_west", label: "Kweneng West" },
  { value: "kgatleng", label: "Kgatleng" },
  { value: "serowe_palapye", label: "Serowe/Palapye" },
  { value: "central_mahalapye", label: "Central Mahalapye" },
  { value: "central_bobonong", label: "Central Bobonong" },
  { value: "central_boteti", label: "Central Boteti" },
  { value: "central_tutume", label: "Central Tutume" },
  { value: "north_east", label: "North East" },
  { value: "ngamiland_east", label: "Ngamiland East" },
  { value: "ngamiland_west", label: "Ngamiland West" },
  { value: "chobe", label: "Chobe" },
  { value: "delta", label: "Delta" },
  { value: "ghanzi", label: "Ghanzi" },
  {
    value: "central_kalahari_game_reserve",
    label: "Central Kalahari Game Reserve",
  },
  { value: "kgalagadi_south", label: "Kgalagadi South" },
  { value: "kgalagadi_north", label: "Kgalagadi North" },
] as const satisfies ReadonlyArray<{ value: District; label: string }>;

export const VILLAGE_OPTIONS = [
  { value: "village_a", label: "Village A" },
  { value: "village_b", label: "Village B" },
  { value: "village_c", label: "Village C" },
  { value: "village_d", label: "Village D" },
  { value: "village_e", label: "Village E" },
] as const satisfies ReadonlyArray<{ value: Village; label: string }>;

export const TOPIC_OPTIONS = [
  { value: "adolescence_youth_risk", label: "Adolescence & youth risk" },
  { value: "puberty_body_changes", label: "Puberty & body changes" },
  { value: "srh", label: "Sexual & reproductive health" },
  { value: "relationships_gender_norms", label: "Relationships & gender norms" },
  { value: "consent_gbv", label: "Consent & GBV" },
  { value: "safeguarding_reporting", label: "Safeguarding & reporting" },
  { value: "other", label: "Other" },
] as const satisfies ReadonlyArray<{ value: Topic; label: string }>;
