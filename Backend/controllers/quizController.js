// ============================================================
// controllers/quizController.js
// Gere les Quiz, leurs Questions, et les Choix de reponses
// ============================================================

const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Choice = require("../models/Choice");

// ------------------------------------------------------------
// Creer un quiz ET ses questions en une seule fois
// req.body attendu :
// {
//   title: "Mon quiz",
//   questions: [
//     { type: "mcq", q: "Question ?", options: ["A","B","C"], correct: 0 }
//   ]
// }
// ------------------------------------------------------------
exports.createQuiz = async (req, res) => {
  try {
    // Etape 1 : on cree d'abord le quiz (sans les questions)
    const nouveauQuiz = await Quiz.create({
      course: req.params.courseId,
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user.id,
    });

    const listeDesQuestions = req.body.questions;

    // Etape 2 : si on a recu des questions, on les cree une par une
    if (listeDesQuestions && listeDesQuestions.length > 0) {
      for (let i = 0; i < listeDesQuestions.length; i++) {
        const questionActuelle = listeDesQuestions[i];

        // Dans notre model, le type s'ecrit "MCQ" ou "TrueFalse"
        // mais dans le formulaire simple on ecrit juste "mcq" ou "tf"
        // Ici on fait la conversion entre les deux
        let typePourLaBase = "MCQ";
        if (questionActuelle.type === "tf") {
          typePourLaBase = "TrueFalse";
        }

        const questionCree = await Question.create({
          quiz: nouveauQuiz._id,
          statement: questionActuelle.q,
          type: typePourLaBase,
          points: 1,
          order: i,
        });

        // Etape 3 : si la question a des choix (A, B, C, D...), on les cree aussi
        const listeDesChoix = questionActuelle.options;

        if (listeDesChoix && listeDesChoix.length > 0) {
          const choixACreer = [];

          for (let j = 0; j < listeDesChoix.length; j++) {
            // "correct" dans le JSON est l'INDEX de la bonne reponse
            // exemple : correct = 0 veut dire que options[0] est la bonne reponse
            const estLaBonneReponse = j === questionActuelle.correct;

            choixACreer.push({
              question: questionCree._id,
              text: listeDesChoix[j],
              isCorrect: estLaBonneReponse,
              order: j,
            });
          }

          // insertMany cree plusieurs documents MongoDB en une seule requete
          // (plus rapide que de faire un .create() dans une boucle)
          await Choice.insertMany(choixACreer);
        }
      }
    }

    res.status(201).json(nouveauQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

// ------------------------------------------------------------
// Publier un quiz (le rendre visible aux students)
// ------------------------------------------------------------
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouve" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

// ------------------------------------------------------------
// Ajouter UNE question a un quiz qui existe deja
// ------------------------------------------------------------
exports.addQuestion = async (req, res) => {
  try {
    const choices = req.body.choices;

    const questionData = {
      quiz: req.params.quizId,
      statement: req.body.statement,
      type: req.body.type,
      points: req.body.points,
      order: req.body.order,
    };

    const question = await Question.create(questionData);

    if (choices && choices.length > 0) {
      const choiceDocs = [];
      for (let i = 0; i < choices.length; i++) {
        const choix = choices[i];
        choix.question = question._id;
        choiceDocs.push(choix);
      }
      await Choice.insertMany(choiceDocs);
    }

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

// ------------------------------------------------------------
// Supprimer un quiz
// ------------------------------------------------------------
exports.deleteQuiz = async (req, res) => {
  try {
    const quizSupprime = await Quiz.findByIdAndDelete(req.params.id);
    if (!quizSupprime) {
      return res.status(404).json({ message: "Quiz non trouve" });
    }
    res.json({ message: "Quiz supprime" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

// ------------------------------------------------------------
// Lister TOUS les quiz, avec le nom du cours et le nombre de questions
// ------------------------------------------------------------
exports.listAllQuizzes = async (req, res) => {
  try {
    // Filtre optionnel : ?courseId=xxx pour ne voir que les quiz d'un cours
    const filtre = {};
    if (req.query.courseId) {
      filtre.course = req.query.courseId;
    }

    // .populate("course") remplace l'ID du cours par les vraies infos du cours
    // (comme ca on peut afficher quiz.course.title cote frontend)
    const quizzes = await Quiz.find(filtre).populate("course");

    // Pour chaque quiz, on compte combien de questions il a
    const quizzesAvecCompte = [];

    for (let i = 0; i < quizzes.length; i++) {
      const nombreQuestions = await Question.countDocuments({ quiz: quizzes[i]._id });

      // .toObject() transforme le document Mongoose en objet JS normal,
      // pour qu'on puisse lui ajouter une nouvelle propriete (questionsCount)
      const quizObjet = quizzes[i].toObject();
      quizObjet.questionsCount = nombreQuestions;

      quizzesAvecCompte.push(quizObjet);
    }

    res.json(quizzesAvecCompte);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};