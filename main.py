from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as palm  # Import the palm library
import os

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="./static"), name="static")

class UserInput(BaseModel):
    user_input: str

# @app.get("/")
# async def home(request: Request):
#     return {"message": "Hello Welcome to Home Page"}

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/process")
async def process_data(user_input: UserInput):
    # Process the user input and generate an AI response
    ai_response = generate_ai_response(user_input.user_input)
    return {"result": ai_response}

def generate_ai_response(user_input):
    # Use the google.generativeai library to generate a response
    palm_api_key = os.environ.get("MY_PALM_KEY")
    palm.configure(api_key=palm_api_key)  # Replace 'YOUR_API_KEY' with your actual API key
    models = [m for m in palm.list_models() if 'generateText' in m.supported_generation_methods]
    model = models[0].name

    prompt = f"""
    You are an expert at solving word problems.

    Solve the following problem:

    {user_input}

    Think about it and describe it in detail.
    """

    completion = palm.generate_text(
        model=model,
        prompt=prompt,
        temperature=0,
        max_output_tokens=800,
    )
    return completion.result

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app)
