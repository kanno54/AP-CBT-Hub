import fs from 'fs';
import path from 'path';

export interface TextbookSectionRef {
  sectionNum: string;
  title: string;
  page: number;
  syllabusCategoryCode: string;
  keywords: string[];
}

export interface TextbookChapterRef {
  chapterNum: number;
  title: string;
  startPage: number;
  sections: TextbookSectionRef[];
}

export interface TextbookTocData {
  bookTitle: string;
  chapters: TextbookChapterRef[];
}

export interface TextbookReference {
  bookTitle: string;
  chapterNum: number;
  chapterTitle: string;
  sectionNum: string;
  sectionTitle: string;
  page: number;
  keywords: string[];
}

let cachedTocData: TextbookTocData | null = null;

export function loadTextbookToc(): TextbookTocData {
  if (cachedTocData) return cachedTocData;

  try {
    const jsonPath = path.join(process.cwd(), 'data', 'textbook_toc.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      cachedTocData = JSON.parse(raw);
      return cachedTocData!;
    }
  } catch (err) {
    console.error('Failed to load data/textbook_toc.json:', err);
  }

  // Fallback TOC structure if file reading fails
  return {
    bookTitle: '徹底攻略 応用情報技術者教科書',
    chapters: [
      {
        chapterNum: 1,
        title: '基礎理論',
        startPage: 37,
        sections: [
          {
            sectionNum: '1-1',
            title: '基礎理論',
            page: 38,
            syllabusCategoryCode: 'TECH_THEORY_ALGO',
            keywords: ['2進数', '補数', '浮動小数点', '離散数学', '論理演算'],
          },
        ],
      },
    ],
  };
}

export function getTextbookReferenceForCategory(
  categoryCode: string,
  categoryName?: string
): TextbookReference {
  const toc = loadTextbookToc();
  const bookTitle = toc.bookTitle || '徹底攻略 応用情報技術者教科書';
  const codeUpper = (categoryCode || '').toUpperCase();
  const nameLower = (categoryName || '').toLowerCase();

  // 1. Direct exact code match or section match
  for (const chap of toc.chapters) {
    for (const sec of chap.sections) {
      if (
        sec.syllabusCategoryCode.toUpperCase() === codeUpper ||
        codeUpper.startsWith(sec.syllabusCategoryCode.toUpperCase()) ||
        sec.syllabusCategoryCode.toUpperCase().startsWith(codeUpper)
      ) {
        return {
          bookTitle,
          chapterNum: chap.chapterNum,
          chapterTitle: chap.title,
          sectionNum: sec.sectionNum,
          sectionTitle: sec.title,
          page: sec.page,
          keywords: sec.keywords || [],
        };
      }
    }
  }

  // 2. Semantic matching rules by category code / domain
  if (codeUpper.includes('SEC')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 3);
    const sec = chap?.sections.find((s) => s.sectionNum === '3-5') || chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('NET')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 3);
    const sec = chap?.sections.find((s) => s.sectionNum === '3-4') || chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('DB')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 3);
    const sec = chap?.sections.find((s) => s.sectionNum === '3-3') || chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('ALG') || codeUpper.includes('THEORY')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 1);
    const sec = chap?.sections.find((s) => s.sectionNum === '1-2' || s.sectionNum === '1-1') || chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('ARCH') || codeUpper.includes('HARD') || codeUpper.includes('SYS')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 2);
    const sec = chap?.sections.find((s) => s.sectionNum === '2-1' || s.sectionNum === '2-2') || chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('PM')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 5);
    const sec = chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('SM') || codeUpper.includes('AUDIT')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 6);
    const sec = codeUpper.includes('AUDIT') ? chap?.sections.find((s) => s.sectionNum === '6-2') : chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('STRAT') || codeUpper.includes('DX')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 8 || c.chapterNum === 7);
    const sec = chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  } else if (codeUpper.includes('LEGAL') || codeUpper.includes('CORP')) {
    const chap = toc.chapters.find((c) => c.chapterNum === 9);
    const sec = codeUpper.includes('LEGAL') ? chap?.sections.find((s) => s.sectionNum === '9-2') : chap?.sections[0];
    if (chap && sec) {
      return {
        bookTitle,
        chapterNum: chap.chapterNum,
        chapterTitle: chap.title,
        sectionNum: sec.sectionNum,
        sectionTitle: sec.title,
        page: sec.page,
        keywords: sec.keywords,
      };
    }
  }

  // Default fallback to Chapter 1, Section 1-1
  const defaultChap = toc.chapters[0];
  const defaultSec = defaultChap.sections[0];

  return {
    bookTitle,
    chapterNum: defaultChap.chapterNum,
    chapterTitle: defaultChap.title,
    sectionNum: defaultSec.sectionNum,
    sectionTitle: defaultSec.title,
    page: defaultSec.page,
    keywords: defaultSec.keywords,
  };
}
