import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking AP-CBT-Hub Database seed status...');

  const fullDataPath = path.join(process.cwd(), 'data', 'questions_full.json');
  let questionsToLoad: any[] = [];

  if (fs.existsSync(fullDataPath)) {
    console.log(`Loading full AP exam dataset from ${fullDataPath}...`);
    const rawData = fs.readFileSync(fullDataPath, 'utf-8');
    questionsToLoad = JSON.parse(rawData);
  }

  if (questionsToLoad.length === 0) {
    console.log('No data/questions_full.json dataset found. Using default seed template...');
    return;
  }

  console.log(`Upserting ${questionsToLoad.length} AP past questions into database with individual explanations...`);

  for (const qItem of questionsToLoad) {
    const { choices, modelAnswers, imageUrls, ...qInfo } = qItem;

    const createdQ = await prisma.question.upsert({
      where: {
        year_season_examType_questionNum: {
          year: qInfo.year,
          season: qInfo.season,
          examType: qInfo.examType,
          questionNum: qInfo.questionNum,
        },
      },
      update: {
        ...qInfo,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      },
      create: {
        ...qInfo,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      },
    });

    if (choices && choices.length > 0) {
      await prisma.choice.deleteMany({ where: { questionId: createdQ.id } });
      for (const c of choices) {
        await prisma.choice.create({
          data: {
            questionId: createdQ.id,
            symbol: c.symbol,
            text: c.text,
            isCorrect: c.isCorrect,
          },
        });
      }
    }

    if (modelAnswers && modelAnswers.length > 0) {
      await prisma.modelAnswer.deleteMany({ where: { questionId: createdQ.id } });
      for (const ma of modelAnswers) {
        await prisma.modelAnswer.create({
          data: {
            questionId: createdQ.id,
            subQuestionNum: ma.subQuestionNum,
            questionText: ma.questionText,
            maxScore: ma.maxScore,
            characterLimit: ma.characterLimit,
            answerText: ma.answerText,
            explanation: ma.explanation,
          },
        });
      }
    }
  }

  console.log('Database Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
