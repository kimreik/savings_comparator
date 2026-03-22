const translations = {
  en: {
    'app.title': 'Saving types comparison',
    'app.tab.chart': '📊 Chart',
    'app.tab.settings': '⚙️ Settings',

    'group.savings': 'Savings',
    'group.property': 'Property',
    'group.mortgage': 'Mortgage',
    'group.general': 'General',

    'label.current': 'Current',
    'label.perMonth': 'Per month',
    'label.deposit': 'deposit (protect from inflation)',
    'label.investRate': 'Invest rate',
    'label.tax': 'tax',
    'label.price': 'Price',
    'label.rent': 'Rent / mo',
    'label.down': 'Down',
    'label.years': 'Years',
    'label.rate': 'Rate',
    'label.horizon': 'Horizon',
    'label.inflation': 'Inflation',

    'chart.empty': 'Add a savings strategy to see the comparison chart',
    'chart.bankrupt': '💀 bankrupt',
    'chart.noHouse': '❌🏚️ no house',

    'strategy.rentMemories': 'rent + memories',
    'strategy.rentCash': 'rent + cash',
    'strategy.rentInvest': 'rent + invest',
    'strategy.mortgageMinMemories': 'mortgage min payment + memories',
    'strategy.mortgageMinCash': 'mortgage min payment + cash',
    'strategy.mortgageMinInvest': 'mortgage min payment + invest',
    'strategy.mortgageMaxMemories': 'mortgage max payment + memories',
    'strategy.mortgageMaxCash': 'mortgage max payment + cash',
    'strategy.mortgageMaxInvest': 'mortgage max payment + invest',
  },
  ru: {
    'app.title': 'Сравнение стратегий накоплений',
    'app.tab.chart': '📊 График',
    'app.tab.settings': '⚙️ Настройки',

    'group.savings': 'Накопления',
    'group.property': 'Недвижимость',
    'group.mortgage': 'Ипотека',
    'group.general': 'Общие',

    'label.current': 'Сейчас',
    'label.perMonth': 'В месяц',
    'label.deposit': 'вклад (защита от инфляции)',
    'label.investRate': 'Доход',
    'label.tax': 'налог',
    'label.price': 'Цена',
    'label.rent': 'Аренда/мес',
    'label.down': 'Взнос',
    'label.years': 'Лет',
    'label.rate': 'Ставка',
    'label.horizon': 'Горизонт',
    'label.inflation': 'Инфляция',

    'chart.empty': 'Добавьте стратегию для отображения графика',
    'chart.bankrupt': '💀 банкрот',
    'chart.noHouse': '❌🏚️ без жилья',

    'strategy.rentMemories': 'аренда + воспоминания',
    'strategy.rentCash': 'аренда + наличные',
    'strategy.rentInvest': 'аренда + инвестиции',
    'strategy.mortgageMinMemories': 'ипотека мин. + воспоминания',
    'strategy.mortgageMinCash': 'ипотека мин. + наличные',
    'strategy.mortgageMinInvest': 'ипотека мин. + инвестиции',
    'strategy.mortgageMaxMemories': 'ипотека макс. + воспоминания',
    'strategy.mortgageMaxCash': 'ипотека макс. + наличные',
    'strategy.mortgageMaxInvest': 'ипотека макс. + инвестиции',
  },
} as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof (typeof translations)['en']

function detectLocale(): Locale {
  const lang = navigator.language?.slice(0, 2) ?? 'en'
  return lang in translations ? (lang as Locale) : 'en'
}

const currentLocale: Locale = detectLocale()

export function t(key: TranslationKey): string {
  return translations[currentLocale][key] ?? translations.en[key] ?? key
}


