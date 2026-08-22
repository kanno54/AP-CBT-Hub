import os
import json
import re
from typing import List, Optional
from pydantic import BaseModel, Field

# Pydantic Schemas matching Prisma DB Schema

class ChoiceSchema(BaseModel):
    symbol: str  # "ア", "イ", "ウ", "エ"
    text: str
    isCorrect: bool = False

class ModelAnswerSchema(BaseModel):
    subQuestionNum: str  # e.g., "設問1 (1)"
    maxScore: Optional[int] = None
    characterLimit: Optional[int] = None
    answerText: str
    explanation: Optional[str] = None

class QuestionSchema(BaseModel):
    year: int
    season: str  # "SPRING" | "AUTUMN" | "WINTER"
    examType: str  # "SUBJECT_A" | "SUBJECT_B"
    questionNum: int
    category: str  # "TECHNOLOGY", "MANAGEMENT", "STRATEGY", "NETWORK", "DATABASE", "SYSTEM_ARCH", "ALGORITHM", etc.
    title: Optional[str] = None
    bodyText: str
    imageUrls: Optional[List[str]] = []
    choices: List[ChoiceSchema] = []
    modelAnswers: List[ModelAnswerSchema] = []

class ExamDataSet(BaseModel):
    questions: List[QuestionSchema]

def parse_subject_a_text(text: str, year: int, season: str) -> List[QuestionSchema]:
    """
    Parses Subject A (午前/択一) text extracted from PDF or past exam dump.
    Sample pattern matching for questions and choices (ア, イ, ウ, エ).
    """
    questions = []
    # Pattern to match questions like 問1, 問2 ...
    q_blocks = re.split(r'\n(?=問\d+[\s\n])', text)
    
    for block in q_blocks:
        match_num = re.search(r'^問(\d+)', block.strip())
        if not match_num:
            continue
        
        q_num = int(match_num.group(1))
        
        # Extract choices (ア, イ, ウ, エ)
        choices = []
        choice_matches = re.findall(r'([ア-エ])\s+([^\nア-エ]+)', block)
        for sym, choice_txt in choice_matches:
            choices.append(ChoiceSchema(
                symbol=sym,
                text=choice_txt.strip(),
                isCorrect=False  # To be set via answer key
            ))
            
        # Clean body text
        body = block.strip()
        
        # Basic category classifier rule
        category = "TECHNOLOGY"
        if q_num > 50 and q_num <= 60:
            category = "MANAGEMENT"
        elif q_num > 60:
            category = "STRATEGY"
            
        questions.append(QuestionSchema(
            year=year,
            season=season,
            examType="SUBJECT_A",
            questionNum=q_num,
            category=category,
            bodyText=body,
            choices=choices
        ))
        
    return questions

def extract_from_pdf(pdf_path: str, year: int, season: str, exam_type: str = "SUBJECT_A") -> ExamDataSet:
    """
    Extracts text and tables using pdfplumber if installed.
    Fallback to returning mock/parsed structured dataset.
    """
    extracted_text = ""
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except ImportError:
        print("pdfplumber not installed. Reading direct text or using parser.")
        if os.path.exists(pdf_path) and pdf_path.endswith('.txt'):
            with open(pdf_path, 'r', encoding='utf-8') as f:
                extracted_text = f.read()

    if exam_type == "SUBJECT_A":
        qs = parse_subject_a_text(extracted_text, year, season)
    else:
        qs = []  # Subject B parsing custom logic
        
    return ExamDataSet(questions=qs)

if __name__ == "__main__":
    print("AP Exam PDF Extractor Pipeline initialized.")
