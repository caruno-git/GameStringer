const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newKeys = {
  it: {
    communityChatTitle: "Community Chat",
    onlineCount: "{{count}} online",
    onlineUsers: "Utenti Online ({{count}})",
    noOneOnline: "Nessuno online",
    writeInRoom: "Scrivi in #{{room}}...",
    selectRoom: "Seleziona stanza...",
    sendMessage: "Invia messaggio",
    loginRequired: "Devi prima effettuare il login in GameStringer.",
    deletedMessage: "Messaggio eliminato",
    editedMessage: "(modificato)",
    connectionError: "Errore di connessione alla chat",
    retry: "Riprova",
    newRoom: "Nuova Stanza",
    roomName: "Nome stanza (es. cyberpunk-ita)",
    roomDesc: "Descrizione breve",
    roomType: "Tipo stanza",
    cancel: "Annulla",
    createRoom: "Crea Stanza",
    roomCreated: "Stanza creata con successo!",
    generalRoom: "Generale",
    gameRoom: "Gioco specifico",
    translationRoom: "Richiesta traduzione",
    feedbackRoom: "Feedback & Bug",
    announcementsRoom: "Annunci",
    userDefault: "Utente",
    chat: "Chat"
  },
  en: {
    communityChatTitle: "Community Chat",
    onlineCount: "{{count}} online",
    onlineUsers: "Online Users ({{count}})",
    noOneOnline: "No one online",
    writeInRoom: "Type in #{{room}}...",
    selectRoom: "Select a room...",
    sendMessage: "Send message",
    loginRequired: "You must login to GameStringer first.",
    deletedMessage: "Message deleted",
    editedMessage: "(edited)",
    connectionError: "Chat connection error",
    retry: "Retry",
    newRoom: "New Room",
    roomName: "Room name (e.g. cyberpunk-ita)",
    roomDesc: "Short description",
    roomType: "Room type",
    cancel: "Cancel",
    createRoom: "Create Room",
    roomCreated: "Room created successfully!",
    generalRoom: "General",
    gameRoom: "Specific Game",
    translationRoom: "Translation Request",
    feedbackRoom: "Feedback & Bugs",
    announcementsRoom: "Announcements",
    userDefault: "User",
    chat: "Chat"
  }
};

// Map other languages to English defaults for now to prevent crashes, then user can translate later or we can try to translate
const fallbackMap = {
  es: { ...newKeys.en, onlineUsers: "Usuarios en línea ({{count}})", generalRoom: "General", chat: "Chat" },
  fr: { ...newKeys.en, onlineUsers: "Utilisateurs en ligne ({{count}})", generalRoom: "Général", chat: "Chat" },
  de: { ...newKeys.en, onlineUsers: "Benutzer online ({{count}})", generalRoom: "Allgemein", chat: "Chat" },
  ja: { ...newKeys.en, onlineUsers: "オンラインユーザー ({{count}})", generalRoom: "一般", chat: "チャット" },
  ko: { ...newKeys.en, onlineUsers: "온라인 사용자 ({{count}})", generalRoom: "일반", chat: "채팅" },
  pl: { ...newKeys.en, onlineUsers: "Użytkownicy online ({{count}})", generalRoom: "Ogólny", chat: "Czat" },
  pt: { ...newKeys.en, onlineUsers: "Usuários online ({{count}})", generalRoom: "Geral", chat: "Chat" },
  ru: { ...newKeys.en, onlineUsers: "Пользователи онлайн ({{count}})", generalRoom: "Общий", chat: "Чат" },
  zh: { ...newKeys.en, onlineUsers: "在线用户 ({{count}})", generalRoom: "一般", chat: "聊天" },
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.communityChat) {
    data.communityChat = {};
  }
  
  const toMerge = newKeys[lang] || fallbackMap[lang] || newKeys.en;
  data.communityChat = { ...data.communityChat, ...toMerge };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
});
