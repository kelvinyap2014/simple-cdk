FROM python:3.8.5

WORKDIR /app
COPY app.py requirements.txt ./

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN rm requirements.txt

CMD [ "python", "app.py" ]