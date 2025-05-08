from pydantic import BaseModel


class CommentDto(BaseModel):
    comment:str
    