const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newKeys = {
  it: {
    changelog: {
      latest: "LATEST",
      featureUpdate: "✨ Feature Update",
      majorRelease: "🚀 Major Release",
      patchNotes: "🔧 Patch Notes",
      currentVersion: "Versione Attuale"
    },
    profile: {
      removeAvatar: "Rimuovi",
      recoveryKey: "Recovery Key",
      saveKeyDesc: "Salva questa chiave per recuperare la password di",
      savedKeyConfirm: "Ho salvato questa chiave in un posto sicuro",
      confirm: "Conferma",
      copy: "Copia",
      download: "Scarica",
      newPassword: "Nuova Password",
      passwordReset: "Password Ripristinata",
      enterKeyDesc: "Inserisci la tua recovery key di 12 parole per",
      chooseNewPassword: "Scegli una nuova password sicura",
      passwordResetSuccess: "La tua password è stata ripristinata con successo",
      historyCleared: "Cronologia attività cancellata",
      disconnectedAll: "Disconnesso da tutte le altre sessioni",
      thisProfile: "questo profilo"
    }
  },
  en: {
    changelog: {
      latest: "LATEST",
      featureUpdate: "✨ Feature Update",
      majorRelease: "🚀 Major Release",
      patchNotes: "🔧 Patch Notes",
      currentVersion: "Current Version"
    },
    profile: {
      removeAvatar: "Remove",
      recoveryKey: "Recovery Key",
      saveKeyDesc: "Save this key to recover your password for",
      savedKeyConfirm: "I have saved this key safely",
      confirm: "Confirm",
      copy: "Copy",
      download: "Download",
      newPassword: "New Password",
      passwordReset: "Password Reset",
      enterKeyDesc: "Enter your 12-word recovery key for",
      chooseNewPassword: "Choose a new secure password",
      passwordResetSuccess: "Your password has been reset successfully",
      historyCleared: "Activity history cleared",
      disconnectedAll: "Disconnected from all other sessions",
      thisProfile: "this profile"
    }
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.changelog) data.changelog = {};
  if (!data.profile) data.profile = {};
  
  const source = newKeys[lang] || newKeys.en;
  
  // Merge changelog
  data.changelog = { ...data.changelog, ...source.changelog };
  
  // Merge profile
  data.profile = { ...data.profile, ...source.profile };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
});
