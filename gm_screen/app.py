import base64
import hashlib
import typing as t

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from . import assets

app = FastAPI()
app.include_router(assets.router, prefix="/assets")


class Item(BaseModel):
    name: str
    price: float
    is_offer: t.Optional[bool] = None


@app.get("/")
def read_root():
    resp = """
<!DOCTYPE html>
<html>
<video src="http://localhost:8000/assets/-KFsLKDKhtxiuZ24TeWgZyTApfKE1H7RyuR_9HyRqgA=" controls>
"""

    return HTMLResponse(resp)


@app.get("/items/{item_id}")
def read_item(item_id: int, q: t.Optional[str] = None):
    return {"item_id": item_id, "q": q}


@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}
