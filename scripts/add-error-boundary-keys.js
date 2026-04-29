const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "somethingWentWrong": "Qualcosa è andato storto",
    "unexpectedErrorReload": "Si è verificato un errore imprevisto. Prova a ricaricare la pagina.",
    "errorDetails": "Dettagli errore",
    "retry": "Riprova",
    "pageError": "Errore Pagina",
    "cannotLoadPage": "Impossibile caricare questa pagina."
  },
  en: {
    "somethingWentWrong": "Something went wrong",
    "unexpectedErrorReload": "An unexpected error occurred. Try reloading the page.",
    "errorDetails": "Error details",
    "retry": "Retry",
    "pageError": "Page Error",
    "cannotLoadPage": "Unable to load this page."
  },
  es: {
    "somethingWentWrong": "Algo salió mal",
    "unexpectedErrorReload": "Ocurrió un error inesperado. Intenta recargar la página.",
    "errorDetails": "Detalles del error",
    "retry": "Reintentar",
    "pageError": "Error de página",
    "cannotLoadPage": "No se puede cargar esta página."
  },
  fr: {
    "somethingWentWrong": "Quelque chose s'est mal passé",
    "unexpectedErrorReload": "Une erreur inattendue s'est produite. Essayez de recharger la page.",
    "errorDetails": "Détails de l'erreur",
    "retry": "Réessayer",
    "pageError": "Erreur de page",
    "cannotLoadPage": "Impossible de charger cette page."
  },
  de: {
    "somethingWentWrong": "Etwas ist schiefgelaufen",
    "unexpectedErrorReload": "Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie, die Seite neu zu laden.",
    "errorDetails": "Fehlerdetails",
    "retry": "Wiederholen",
    "pageError": "Seitenfehler",
    "cannotLoadPage": "Diese Seite kann nicht geladen werden."
  },
  ja: {
    "somethingWentWrong": "問題が発生しました",
    "unexpectedErrorReload": "予期しないエラーが発生しました。ページを再読み込みしてみてください。",
    "errorDetails": "エラーの詳細",
    "retry": "再試行",
    "pageError": "ページエラー",
    "cannotLoadPage": "このページを読み込むことができません。"
  },
  ko: {
    "somethingWentWrong": "문제가 발생했습니다",
    "unexpectedErrorReload": "예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 보세요.",
    "errorDetails": "오류 세부정보",
    "retry": "다시 시도",
    "pageError": "페이지 오류",
    "cannotLoadPage": "이 페이지를 로드할 수 없습니다."
  },
  zh: {
    "somethingWentWrong": "出了点问题",
    "unexpectedErrorReload": "发生意外错误。请尝试重新加载页面。",
    "errorDetails": "错误详情",
    "retry": "重试",
    "pageError": "页面错误",
    "cannotLoadPage": "无法加载此页面。"
  },
  pt: {
    "somethingWentWrong": "Algo deu errado",
    "unexpectedErrorReload": "Ocorreu um erro inesperado. Tente recarregar a página.",
    "errorDetails": "Detalhes do erro",
    "retry": "Tentar novamente",
    "pageError": "Erro de página",
    "cannotLoadPage": "Não foi possível carregar esta página."
  },
  ru: {
    "somethingWentWrong": "Что-то пошло не так",
    "unexpectedErrorReload": "Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.",
    "errorDetails": "Детали ошибки",
    "retry": "Повторить",
    "pageError": "Ошибка страницы",
    "cannotLoadPage": "Невозможно загрузить эту страницу."
  },
  pl: {
    "somethingWentWrong": "Coś poszło nie tak",
    "unexpectedErrorReload": "Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.",
    "errorDetails": "Szczegóły błędu",
    "retry": "Spróbuj ponownie",
    "pageError": "Błąd strony",
    "cannotLoadPage": "Nie można załadować tej strony."
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.common) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.common, keys);
    console.log(`✓ ${file}: aggiunte chiavi error boundary`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi error boundary aggiunte a tutti i file locale!');
