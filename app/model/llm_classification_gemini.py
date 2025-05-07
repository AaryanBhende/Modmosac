from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
from model.prompt import prompt

load_dotenv()

class Category(Enum):
    HATE = "hate"
    OFFENSIVE = "offensive"
    SEXUAL = "sexual"
    VIOLENCE = "violence"
    SELFHARM = "self harm"
    NONE = "none"

class Analysis(BaseModel):
    '''Analysis of the comments'''
    offensive: bool = Field(description="Is the comment an offensive comment? Answer with true or false.")
    category:Category = Field(description="what is the category of the ofensive comment")
    rating: Optional[int] = Field(description="Overall rating of the comment from 1 to 5, 5 being a comment with significant hate or offense.")

class Infer():
    def __init__(self):
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0,
                max_tokens=None,
                timeout=None,
                max_retries=2
            )
            self.structured_llm = self.llm.with_structured_output(Analysis)
        except Exception as e:
            print(f"Error initializing LLM: {e}")
            self.llm = None
        
    def classify_comment(self, comment: str, max_retries: int = 3) -> Analysis:
        text = prompt(comment)
        try:
            response = self.structured_llm.invoke(text)
            return response
        except Exception as e:
            print(f"Error during classification: {e}")
