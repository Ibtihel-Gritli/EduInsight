const MESSAGE_FALLBACK = "Desole, je ne peux pas repondre pour le moment. Reessaie plus tard.";

const PROMPT_SYSTEME = "Tu es l assistant virtuel de la plateforme EduInsight. " +
  "Tu aides les utilisateurs (students, teachers, admins) a comprendre comment utiliser " +
  "l application : cours, quiz, inscriptions, progression. Reponds toujours en francais, " +
  "de facon courte et claire.";

exports.demanderReponseIA = async function (messageUtilisateur, contexteUtilisateur) {
  const cleApi = process.env.GROQ_API_KEY;

  if (!cleApi) {
    console.log("GROQ_API_KEY manquante dans .env");
    return MESSAGE_FALLBACK;
  }

  try {
    let promptComplet = PROMPT_SYSTEME;
    if (contexteUtilisateur) {
      promptComplet = promptComplet + " L utilisateur actuel s appelle " +
        contexteUtilisateur.lastName + " et a le role " + contexteUtilisateur.role + ".";
    }

    const reponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cleApi,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: promptComplet },
          { role: "user", content: messageUtilisateur },
        ],
        max_tokens: 300,
      }),
    });

    const donnees = await reponse.json();

    if (!reponse.ok) {
      console.log("Erreur Groq : " + JSON.stringify(donnees));
      return MESSAGE_FALLBACK;
    }

    return donnees.choices[0].message.content;
  } catch (err) {
    console.log("Erreur appel Groq : " + err.message);
    return MESSAGE_FALLBACK;
  }
};