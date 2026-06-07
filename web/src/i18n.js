// French strings ported from the mobile app's translations/fr.json
const fr = {
  reload: "recharger",
  took_place_on: "a eu lieu le",
  dashboard: "Dashboard",
  profile: "Profil",
  used_app_before: "Avez-vous vos identifiants de connexion ?",
  yes: "OUI",
  no: "NON",
  welcome_login:
    "Bienvenue! Pour Accéder à votre compte, merci de vous identifier",
  email: "Email",
  password: "Mot de passe",
  connect: "Se connecter",
  email_provided:
    "Veuillez entrer l'adresse email fournie par votre superviseur et utiliser un mot de passe de votre choix.",
  choose_password: "Choisissez votre mot de passe",
  enter_new_password:
    "Entrez votre nouveau mot de passe. Il doit contenir au moins 8 caractères.",
  logout: "Se déconnecter",
  reload_btn: "Recharger",

  diagnostics: "Statistiques",
  information: "Information",
  collect_reports: "Collecte Plaintes ou Suggestions",
  search_reports: "Résumé de mes Plaintes",
  account_insights: "Aperçu du Compte",

  label_grm: "MGP",
  grm_management: "Gestion de la plainte",
  your_summary: "Votre résumé",
  your_issues_label: "Liste de vos plaintes",
  reported: "Réportée",
  assigned: "Assignée",
  resolved: "Résolue",
  actions: "ACTIONS",
  details: "DETAILS",
  history: "HISTORIQUE",
  days_ago: "jours écoulés",
  status_label: "Status",
  label_reference: "N°:",
  no_results: "Aucun résultat trouvé",

  name: "Nom:",
  age: "Age:",
  type: "Type de saisie:",
  sub_type: "Typologie:",
  component: "Composante:",
  location: "Localité:",
  category: "Catégorie:",
  assigned_to: "Assigné à:",
  description_label: "Description",
  decision: "Décision",
  satisfaction: "Satisfaction",
  appeal_reason: "Raison de l'appel",
  attachments_label: "Pièces jointes",
  back: "Retour",
  information_not_available: "Information non disponible",
  confidential: "Confidentiel",
  pending_assignment: "Pas encore assignée",

  your_complaint_count: "Nombre de vos plaintes",
  your_personal_info: "Vos informations personnelles",
  full_name: "Nom complet",
  phone: "Téléphone",
  department: "Département",
  is_village_secretary: "Est sécrétaire de séance",
  region: "Région",

  loading: "Chargement...",
  something_wrong: "Une erreur s'est produite. Veuillez réessayer.",
  no_credentials_profile:
    "Ce compte n'a pas de profil facilitateur. Utilisez un compte facilitateur.",
  required_field: "Ce champ est requis",
};

export function t(key) {
  return fr[key] ?? key;
}

export default { t };
