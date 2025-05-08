from fastapi import FastAPI

from comment_dto import CommentDto
from model.llm_classification_gemini import Infer

server = FastAPI()

model=Infer()

@server.post("/get-inference")
def infer(comment_dto:CommentDto):
    print(comment_dto.comment)
    result=model.classify_comment(comment_dto.comment)
    print(result)
    return result
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(server, host="127.0.0.1", port=8000)
    