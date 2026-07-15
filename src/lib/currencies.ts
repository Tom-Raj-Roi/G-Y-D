// Currencies with country flag emoji, full country name, and currency details
export interface Currency {
  code: string;        // ISO 4217 code
  name: string;        // Full currency name
  symbol: string;      // Currency symbol
  country: string;     // Full country name
  iso: string;         // ISO 3166-1 alpha-2
  flag: string;        // Flag emoji
}

function flag(iso: string): string {
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States", iso: "US", flag: flag("US") },
  { code: "EUR", name: "Euro", symbol: "\u20AC", country: "Eurozone", iso: "EU", flag: flag("EU") },
  { code: "GBP", name: "British Pound", symbol: "\u00A3", country: "United Kingdom", iso: "GB", flag: flag("GB") },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9", country: "India", iso: "IN", flag: flag("IN") },
  { code: "SAR", name: "Saudi Riyal", symbol: "SR", country: "Saudi Arabia", iso: "SA", flag: flag("SA") },
  { code: "AED", name: "UAE Dirham", symbol: "AED", country: "United Arab Emirates", iso: "AE", flag: flag("AE") },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", country: "Qatar", iso: "QA", flag: flag("QA") },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", country: "Kuwait", iso: "KW", flag: flag("KW") },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", country: "Bahrain", iso: "BH", flag: flag("BH") },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", country: "Oman", iso: "OM", flag: flag("OM") },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada", iso: "CA", flag: flag("CA") },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", country: "Australia", iso: "AU", flag: flag("AU") },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "New Zealand", iso: "NZ", flag: flag("NZ") },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5", country: "Japan", iso: "JP", flag: flag("JP") },
  { code: "CNY", name: "Chinese Yuan", symbol: "\u00A5", country: "China", iso: "CN", flag: flag("CN") },
  { code: "KRW", name: "South Korean Won", symbol: "\u20A9", country: "South Korea", iso: "KR", flag: flag("KR") },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore", iso: "SG", flag: flag("SG") },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", country: "Hong Kong", iso: "HK", flag: flag("HK") },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "Malaysia", iso: "MY", flag: flag("MY") },
  { code: "THB", name: "Thai Baht", symbol: "\u0E3F", country: "Thailand", iso: "TH", flag: flag("TH") },
  { code: "PHP", name: "Philippine Peso", symbol: "\u20B1", country: "Philippines", iso: "PH", flag: flag("PH") },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "Indonesia", iso: "ID", flag: flag("ID") },
  { code: "VND", name: "Vietnamese Dong", symbol: "\u20AB", country: "Vietnam", iso: "VN", flag: flag("VN") },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil", iso: "BR", flag: flag("BR") },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", country: "Mexico", iso: "MX", flag: flag("MX") },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$", country: "Argentina", iso: "AR", flag: flag("AR") },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$", country: "Chile", iso: "CL", flag: flag("CL") },
  { code: "COP", name: "Colombian Peso", symbol: "COP$", country: "Colombia", iso: "CO", flag: flag("CO") },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "Peru", iso: "PE", flag: flag("PE") },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "Switzerland", iso: "CH", flag: flag("CH") },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden", iso: "SE", flag: flag("SE") },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway", iso: "NO", flag: flag("NO") },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark", iso: "DK", flag: flag("DK") },
  { code: "PLN", name: "Polish Zloty", symbol: "z\u0142", country: "Poland", iso: "PL", flag: flag("PL") },
  { code: "CZK", name: "Czech Koruna", symbol: "K\u010D", country: "Czech Republic", iso: "CZ", flag: flag("CZ") },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", country: "Hungary", iso: "HU", flag: flag("HU") },
  { code: "RON", name: "Romanian Leu", symbol: "lei", country: "Romania", iso: "RO", flag: flag("RO") },
  { code: "BGN", name: "Bulgarian Lev", symbol: "lv", country: "Bulgaria", iso: "BG", flag: flag("BG") },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", country: "Croatia", iso: "HR", flag: flag("HR") },
  { code: "RUB", name: "Russian Ruble", symbol: "\u20BD", country: "Russia", iso: "RU", flag: flag("RU") },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "\u20B4", country: "Ukraine", iso: "UA", flag: flag("UA") },
  { code: "TRY", name: "Turkish Lira", symbol: "\u20BA", country: "Turkey", iso: "TR", flag: flag("TR") },
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "South Africa", iso: "ZA", flag: flag("ZA") },
  { code: "EGP", name: "Egyptian Pound", symbol: "E\u00A3", country: "Egypt", iso: "EG", flag: flag("EG") },
  { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", country: "Nigeria", iso: "NG", flag: flag("NG") },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "Kenya", iso: "KE", flag: flag("KE") },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20B5", country: "Ghana", iso: "GH", flag: flag("GH") },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", country: "Ethiopia", iso: "ET", flag: flag("ET") },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", country: "Tanzania", iso: "TZ", flag: flag("TZ") },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", country: "Morocco", iso: "MA", flag: flag("MA") },
  { code: "TND", name: "Tunisian Dinar", symbol: "DT", country: "Tunisia", iso: "TN", flag: flag("TN") },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", country: "Pakistan", iso: "PK", flag: flag("PK") },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "\u09F3", country: "Bangladesh", iso: "BD", flag: flag("BD") },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", country: "Sri Lanka", iso: "LK", flag: flag("LK") },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", country: "Nepal", iso: "NP", flag: flag("NP") },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K", country: "Myanmar", iso: "MM", flag: flag("MM") },
  { code: "KHR", name: "Cambodian Riel", symbol: "\u17DB", country: "Cambodia", iso: "KH", flag: flag("KH") },
  { code: "IQD", name: "Iraqi Dinar", symbol: "IQD", country: "Iraq", iso: "IQ", flag: flag("IQ") },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD", country: "Jordan", iso: "JO", flag: flag("JO") },
  { code: "LBP", name: "Lebanese Pound", symbol: "LBP", country: "Lebanon", iso: "LB", flag: flag("LB") },
  { code: "ILS", name: "Israeli Shekel", symbol: "\u20AA", country: "Israel", iso: "IL", flag: flag("IL") },
  { code: "IRR", name: "Iranian Rial", symbol: "\uFDFC", country: "Iran", iso: "IR", flag: flag("IR") },
  { code: "AFN", name: "Afghan Afghani", symbol: "AFN", country: "Afghanistan", iso: "AF", flag: flag("AF") },
].sort((a, b) => a.country.localeCompare(b.country));

export function getCurrencyLabel(c: Currency): string {
  return `${c.flag} ${c.country} - ${c.name} (${c.symbol})`;
}

export function findCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}
