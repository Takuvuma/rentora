export const COUNTRIES = [
  // Africa
  { code: 'ZW', dial: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: 'ZA', dial: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana' },
  // North America
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States' },
  // Europe
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: 'BE', dial: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: 'SE', dial: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: 'NO', dial: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: 'DK', dial: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: 'CH', dial: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: 'AT', dial: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'IE', dial: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: 'PL', dial: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: 'SK', dial: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: 'HU', dial: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: 'RO', dial: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: 'BG', dial: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: 'HR', dial: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: 'SI', dial: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: 'GR', dial: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: 'EE', dial: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: 'LV', dial: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: 'LT', dial: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: 'LU', dial: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: 'MT', dial: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: 'CY', dial: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: 'IS', dial: '+354', flag: '🇮🇸', name: 'Iceland' },
] as const

export type CountryCode = typeof COUNTRIES[number]['code']

export function getDialCode(countryCode: string): string {
  return COUNTRIES.find(c => c.code === countryCode)?.dial ?? ''
}
