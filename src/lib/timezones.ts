export interface CountryOption {
  code: string;
  name: string;
  defaultTimezone: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "BD", name: "Bangladesh", defaultTimezone: "Asia/Dhaka" },
  { code: "US", name: "United States", defaultTimezone: "America/New_York" },
  { code: "GB", name: "United Kingdom", defaultTimezone: "Europe/London" },
  { code: "IN", name: "India", defaultTimezone: "Asia/Kolkata" },
  { code: "CA", name: "Canada", defaultTimezone: "America/Toronto" },
  { code: "AU", name: "Australia", defaultTimezone: "Australia/Sydney" },
  { code: "DE", name: "Germany", defaultTimezone: "Europe/Berlin" },
  { code: "FR", name: "France", defaultTimezone: "Europe/Paris" },
  { code: "AE", name: "United Arab Emirates", defaultTimezone: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", defaultTimezone: "Asia/Riyadh" },
  { code: "SG", name: "Singapore", defaultTimezone: "Asia/Singapore" },
  { code: "JP", name: "Japan", defaultTimezone: "Asia/Tokyo" },
  { code: "CN", name: "China", defaultTimezone: "Asia/Shanghai" },
  { code: "PK", name: "Pakistan", defaultTimezone: "Asia/Karachi" },
  { code: "MY", name: "Malaysia", defaultTimezone: "Asia/Kuala_Lumpur" },
  { code: "ID", name: "Indonesia", defaultTimezone: "Asia/Jakarta" },
  { code: "TR", name: "Turkey", defaultTimezone: "Europe/Istanbul" },
  { code: "IT", name: "Italy", defaultTimezone: "Europe/Rome" },
  { code: "ES", name: "Spain", defaultTimezone: "Europe/Madrid" },
  { code: "NL", name: "Netherlands", defaultTimezone: "Europe/Amsterdam" },
  { code: "RU", name: "Russia", defaultTimezone: "Europe/Moscow" },
  { code: "BR", name: "Brazil", defaultTimezone: "America/Sao_Paulo" },
];

export const TIMEZONES: TimezoneOption[] = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka", offset: "(UTC+06:00)" },
  { value: "UTC", label: "UTC", offset: "(UTC+00:00)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata", offset: "(UTC+05:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai", offset: "(UTC+04:00)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh", offset: "(UTC+03:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore", offset: "(UTC+08:00)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo", offset: "(UTC+09:00)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai", offset: "(UTC+08:00)" },
  { value: "Asia/Karachi", label: "Asia/Karachi", offset: "(UTC+05:00)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta", offset: "(UTC+07:00)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok", offset: "(UTC+07:00)" },
  { value: "Europe/London", label: "Europe/London", offset: "(UTC+00:00)" },
  { value: "Europe/Berlin", label: "Europe/Berlin", offset: "(UTC+01:00)" },
  { value: "Europe/Paris", label: "Europe/Paris", offset: "(UTC+01:00)" },
  { value: "Europe/Rome", label: "Europe/Rome", offset: "(UTC+01:00)" },
  { value: "Europe/Madrid", label: "Europe/Madrid", offset: "(UTC+01:00)" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam", offset: "(UTC+01:00)" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul", offset: "(UTC+03:00)" },
  { value: "Europe/Moscow", label: "Europe/Moscow", offset: "(UTC+03:00)" },
  { value: "America/New_York", label: "America/New_York", offset: "(UTC-05:00)" },
  { value: "America/Chicago", label: "America/Chicago", offset: "(UTC-06:00)" },
  { value: "America/Denver", label: "America/Denver", offset: "(UTC-07:00)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles", offset: "(UTC-08:00)" },
  { value: "America/Toronto", label: "America/Toronto", offset: "(UTC-05:00)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo", offset: "(UTC-03:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney", offset: "(UTC+10:00)" },
];
