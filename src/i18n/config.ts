import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    common: {
      // Navigation
      dashboard: "Dashboard",
      artifacts: "Artifacts", 
      search: "Search",
      history: "History",
      reports: "Reports",
      users: "Users",
      settings: "Settings",
      
      // Actions
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      export: "Export",
      import: "Import",
      backup: "Backup",
      searchAction: "Search",
      filter: "Filter",
      clear: "Clear",
      submit: "Submit",
      
      // Common
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      close: "Close",
      view: "View",
      details: "Details",
      
      // Language
      language: "Language",
      english: "English",
      russian: "Russian", 
      uzbek: "Uzbek"
    },
    artifacts: {
      title: "Artifacts",
      addArtifact: "Add Artifact",
      artifactDetails: "Artifact Details",
      
      // Fields
      accessionNumber: "Accession Number",
      artifactTitle: "Title",
      description: "Description",
      category: "Category",
      period: "Period",
      culture: "Culture",
      material: "Material",
      condition: "Condition",
      location: "Location",
      locationCustomName: "Custom Location Name",
      acquisitionDate: "Acquisition Date",
      acquisitionMethod: "Acquisition Method",
      provenance: "Provenance",
      estimatedValue: "Estimated Value",
      dimensions: "Dimensions",
      width: "Width (cm)",
      height: "Height (cm)",
      depth: "Depth (cm)",
      weight: "Weight (g)",
      conservationNotes: "Conservation Notes",
      exhibitionHistory: "Exhibition History",
      tags: "Tags",
      imageUrl: "Image URL",
      vitrineImageUrl: "Vitrine Image URL",
      donorName: "Donor Name",
      
      // Categories
      ceramics: "Ceramics",
      stoneObjects: "Stone Objects", 
      glass: "Glass",
      metals: "Metals",
      textiles: "Textiles",
      paintings: "Paintings",
      sculptures: "Sculptures",
      manuscripts: "Manuscripts",
      coins: "Coins",
      jewelry: "Jewelry",
      custom: "Custom",
      
      // Acquisition Methods
      purchase: "Purchase",
      donation: "Donation", 
      loan: "Loan",
      exchange: "Exchange",
      fieldwork: "Fieldwork",
      transfer: "Transfer",
      
      // Conditions
      excellent: "Excellent",
      good: "Good",
      fair: "Fair", 
      poor: "Poor",
      damaged: "Damaged",
      
      // Messages
      artifactAdded: "Artifact added successfully",
      artifactUpdated: "Artifact updated successfully",
      artifactDeleted: "Artifact deleted successfully"
    },
    auth: {
      login: "Login",
      logout: "Logout",
      email: "Email",
      password: "Password",
      signIn: "Sign In",
      profile: "Profile",
      adminPanel: "Admin Panel"
    },
    dashboard: {
      welcome: "Welcome to ARIMUS",
      totalArtifacts: "Total Artifacts",
      recentActivity: "Recent Activity",
      quickActions: "Quick Actions"
    }
  },
  ru: {
    common: {
      // Navigation
      dashboard: "Панель управления",
      artifacts: "Артефакты",
      search: "Поиск", 
      history: "История",
      reports: "Отчеты",
      users: "Пользователи",
      settings: "Настройки",
      
      // Actions
      add: "Добавить",
      edit: "Редактировать",
      delete: "Удалить", 
      save: "Сохранить",
      cancel: "Отмена",
      export: "Экспорт",
      import: "Импорт",
      backup: "Резервная копия",
      searchAction: "Поиск",
      filter: "Фильтр",
      clear: "Очистить",
      submit: "Отправить",
      
      // Common
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      confirm: "Подтвердить",
      close: "Закрыть", 
      view: "Просмотр",
      details: "Детали",
      
      // Language
      language: "Язык",
      english: "Английский",
      russian: "Русский",
      uzbek: "Узбекский"
    },
    artifacts: {
      title: "Артефакты",
      addArtifact: "Добавить артефакт",
      artifactDetails: "Детали артефакта",
      
      // Fields
      accessionNumber: "Инвентарный номер",
      artifactTitle: "Название",
      description: "Описание",
      category: "Категория",
      period: "Период",
      culture: "Культура",
      material: "Материал",
      condition: "Состояние",
      location: "Местоположение",
      locationCustomName: "Индивидуальное название места",
      acquisitionDate: "Дата поступления",
      acquisitionMethod: "Способ поступления",
      provenance: "Происхождение",
      estimatedValue: "Оценочная стоимость",
      dimensions: "Размеры",
      width: "Ширина (см)",
      height: "Высота (см)",
      depth: "Глубина (см)",
      weight: "Вес (г)",
      conservationNotes: "Консервационные заметки",
      exhibitionHistory: "История выставок",
      tags: "Теги",
      imageUrl: "URL изображения",
      vitrineImageUrl: "URL изображения витрины",
      donorName: "Имя жертвователя",
      
      // Categories
      ceramics: "Керамика",
      stoneObjects: "Каменные изделия",
      glass: "Стекло",
      metals: "Металлы",
      textiles: "Текстиль",
      paintings: "Картины",
      sculptures: "Скульптуры",
      manuscripts: "Рукописи",
      coins: "Монеты",
      jewelry: "Ювелирные изделия",
      custom: "Пользовательская",
      
      // Acquisition Methods
      purchase: "Покупка",
      donation: "Пожертвование",
      loan: "Кредит",
      exchange: "Обмен",
      fieldwork: "Полевые работы",
      transfer: "Передача",
      
      // Conditions
      excellent: "Отличное",
      good: "Хорошее",
      fair: "Удовлетворительное",
      poor: "Плохое",
      damaged: "Поврежденное",
      
      // Messages
      artifactAdded: "Артефакт успешно добавлен",
      artifactUpdated: "Артефакт успешно обновлен",
      artifactDeleted: "Артефакт успешно удален"
    },
    auth: {
      login: "Вход",
      logout: "Выход",
      email: "Электронная почта",
      password: "Пароль",
      signIn: "Войти",
      profile: "Профиль",
      adminPanel: "Панель администратора"
    },
    dashboard: {
      welcome: "Добро пожаловать в ARIMUS",
      totalArtifacts: "Всего артефактов",
      recentActivity: "Недавняя активность",
      quickActions: "Быстрые действия"
    }
  },
  uz: {
    common: {
      // Navigation
      dashboard: "Boshqaruv paneli",
      artifacts: "Artifaktlar",
      search: "Qidiruv",
      history: "Tarix",
      reports: "Hisobotlar",
      users: "Foydalanuvchilar",
      settings: "Sozlamalar",
      
      // Actions
      add: "Qo'shish",
      edit: "Tahrirlash",
      delete: "O'chirish",
      save: "Saqlash",
      cancel: "Bekor qilish",
      export: "Eksport",
      import: "Import",
      backup: "Zaxira nusxa",
      searchAction: "Qidiruv",
      filter: "Filter",
      clear: "Tozalash",
      submit: "Yuborish",
      
      // Common
      loading: "Yuklanmoqda...",
      error: "Xato",
      success: "Muvaffaqiyat",
      confirm: "Tasdiqlash",
      close: "Yopish",
      view: "Ko'rish",
      details: "Tafsilotlar",
      
      // Language
      language: "Til",
      english: "Inglizcha",
      russian: "Ruscha",
      uzbek: "O'zbekcha"
    },
    artifacts: {
      title: "Artifaktlar",
      addArtifact: "Artifakt qo'shish",
      artifactDetails: "Artifakt tafsilotlari",
      
      // Fields
      accessionNumber: "Inventar raqami",
      artifactTitle: "Nomi",
      description: "Tavsif",
      category: "Kategoriya",
      period: "Davr",
      culture: "Madaniyat",
      material: "Material",
      condition: "Holati",
      location: "Joylashuv",
      locationCustomName: "Maxsus joy nomi",
      acquisitionDate: "Kiritilgan sana",
      acquisitionMethod: "Kiritish usuli",
      provenance: "Kelib chiqishi",
      estimatedValue: "Taxminiy qiymati",
      dimensions: "O'lchamlari",
      width: "Kengligi (sm)",
      height: "Balandligi (sm)",
      depth: "Chuqurligi (sm)",
      weight: "Og'irligi (g)",
      conservationNotes: "Konservatsiya izohlar",
      exhibitionHistory: "Ko'rgazma tarixi",
      tags: "Teglar",
      imageUrl: "Rasm URL",
      vitrineImageUrl: "Vitrina rasm URL",
      donorName: "Xayriya qiluvchi ismi",
      
      // Categories
      ceramics: "Keramika",
      stoneObjects: "Tosh buyumlar",
      glass: "Shisha",
      metals: "Metallar",
      textiles: "To'qimachilik",
      paintings: "Rasmlar",
      sculptures: "Haykallar",
      manuscripts: "Qo'lyozmalar",
      coins: "Tangalar",
      jewelry: "Zargarlik buyumlari",
      custom: "Maxsus",
      
      // Acquisition Methods
      purchase: "Sotib olish",
      donation: "Xayriya",
      loan: "Qarz",
      exchange: "Almashinuv",
      fieldwork: "Dala ishi",
      transfer: "O'tkazish",
      
      // Conditions
      excellent: "A'lo",
      good: "Yaxshi",
      fair: "O'rtacha",
      poor: "Yomon",
      damaged: "Shikastlangan",
      
      // Messages
      artifactAdded: "Artifakt muvaffaqiyatli qo'shildi",
      artifactUpdated: "Artifakt muvaffaqiyatli yangilandi",
      artifactDeleted: "Artifakt muvaffaqiyatli o'chirildi"
    },
    auth: {
      login: "Kirish",
      logout: "Chiqish",
      email: "Elektron pochta",
      password: "Parol",
      signIn: "Tizimga kirish",
      profile: "Profil",
      adminPanel: "Administrator paneli"
    },
    dashboard: {
      welcome: "ARIMUS ga xush kelibsiz",
      totalArtifacts: "Jami artifaktlar",
      recentActivity: "So'nggi faollik",
      quickActions: "Tezkor harakatlar"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    ns: ['common', 'artifacts', 'auth', 'dashboard'],
    defaultNS: 'common'
  });

export default i18n;