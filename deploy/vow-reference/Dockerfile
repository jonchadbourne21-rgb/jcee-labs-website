# VOW 1.1 local/integration reference image. This is not a production-hardened edge deployment.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:${PATH}"

RUN python -m venv /opt/venv \
    && apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/vow

# The immutable package source is present before installation, which is required
# by its pyproject package layout. Do not patch the frozen source in this image.
COPY vendor/vow-1.1/ /opt/vow/
RUN pip install --no-cache-dir . "psycopg[binary]>=3.1,<4"

COPY deploy/vow-reference/recovery_worker.py /opt/vow-deployment/recovery_worker.py

RUN sha256sum -c CAUSAL-EFFECTS-MANIFEST.sha256

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3).read()"

ENTRYPOINT ["python", "/opt/vow/api_server.py"]
CMD ["--host", "0.0.0.0", "--port", "8080"]
