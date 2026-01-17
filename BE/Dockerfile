FROM python:3.9-slim

USER root

# Install system dependencies including make FIRST
RUN apt-get update && apt-get install -y make && rm -rf /var/lib/apt/lists/*

# Create non root user power_user
RUN adduser --quiet --disabled-password \
    --home /home/power_user \
    --shell /bin/bash power_user
RUN adduser power_user sudo

# Set working directory.
WORKDIR /srv

# Set PYTHONPATH
ENV PYTHONPATH="/srv"

# Install dependencies used on dev (includes testing packages)
COPY ./requirements.dev.txt .
COPY ./requirements/PIP_VERSION .

RUN pip install pip-tools

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip=="$(cat PIP_VERSION)" \
 && pip install --no-cache-dir -r requirements.dev.txt

COPY . /srv

USER power_user

EXPOSE 8081

CMD ["uvicorn", "src.main:application", "--host", "0.0.0.0", "--port", "8081"]