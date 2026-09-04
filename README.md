ASK VENKAT — CLOUDFLARE SETUP

Cloudflare build settings

Build command:
echo "No build step"

Deploy command:
uv run pywrangler deploy


Required Cloudflare secrets

GROQ_API_KEY
INGEST_SECRET


Existing Vectorize index

ask-venkat-knowledge

Dimensions:
768

Metric:
cosine


After deployment

1. Confirm /health works.

2. Add GROQ_API_KEY as a Cloudflare secret.

3. Add INGEST_SECRET as a Cloudflare secret.

4. Call:

POST /api/admin/ingest

with header:

x-ingest-secret: YOUR_INGEST_SECRET

This loads the resume knowledge into Vectorize.

5. Test the chatbot with:

What did you do at Amazon?

Tell me about your data engineering experience.

What are your strongest technical skills?


Production URL

https://ask-venkat-cloudflare.venkateshwarreddy32.workers.dev