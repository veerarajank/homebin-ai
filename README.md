# HomeBin AI ![Home Bin AI Logo](https://github.com/veerarajank/homebin-ai/blob/main/assets/images/favicon.png)

**Your Smart Home Waste Assistant: Scan, Sort, & Recycle Right, Every Time.**

[![Built with Bolt.new](https://img.shields.io/badge/Built%20with-Bolt.new-blueviolet)](https://bolt.new)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 💡 Project Overview

HomeBin AI is a cross-platform mobile web application designed to eliminate confusion around household waste sorting and promote accurate recycling. Leveraging cutting-edge AI, it allows users to simply snap a picture of any waste item and receive instant, hyperlocal instructions on exactly which bin it belongs in.

**The Problem:** Recycling rules are complex, vary significantly by local council (like Chelmsford, UK!), and are constantly changing. This leads to confusion, frustration, and ultimately, high rates of recycling contamination, undermining environmental efforts.

**Our Solution:** HomeBin AI cuts through the confusion. We've built an intelligent system that combines powerful multimodal AI with a hyperlocal knowledge base to provide precise, actionable waste sorting advice, making accurate recycling effortless for everyone.

---

## ✨ Key Features

* **Effortless Image Scan:** Capture waste items with your device camera or upload from your gallery.
* **Highly Accurate AI Classification:** Powered by Google Gemini's cutting-edge multimodal capabilities, HomeBin AI accurately identifies diverse and nuanced waste items (e.g., distinguishing "broken glass" from a "glass bottle," or identifying a "ceramic cup").
* **Hyperlocal Recycling Rules (RAG):** Integrates with a vector database (Qdrant) containing real, scraped local council recycling guidelines to provide truly specific instructions for your area.
* **Clear Bin Instructions:** Get clear, actionable advice on which bin to use .
* **Intuitive User Interface:** A clean, mobile-first design built with Expo and Bolt.new for a seamless user experience across Web, iOS, and Android.
* **Continuous Learning Feedback Loop:** A built-in mechanism allows users to provide feedback, which informs future AI model improvements and rule refinements.

---

## 🔄 The AI Journey: Iteration, Challenges, and Breakthroughs

Developing a precise waste classification AI was an iterative process. We experimented with several approaches to find the most accurate and efficient solution:

1.  **Attempt 1: ML5.js with CocoSsd (Client-Side)**
    * **Approach:** Initially, we tried client-side object detection using `ml5.js` with the `CocoSsd` model directly in the browser.
    * **Outcome:** While quick to implement and offering good general object detection, `CocoSsd` is trained on common objects (e.g., "cup," "bottle," "paper"). It lacked the fine-grained understanding necessary for waste (e.g., classifying a ceramic cup as "paper," or a broken glass as just "glass" without specifying "broken"). Its accuracy for waste-specific categories was low, and it couldn't differentiate materials relevant to recycling.
    * **Lesson Learned:** General-purpose models require domain-specific fine-tuning or a more powerful, flexible approach for nuanced waste classification.

2.  **Attempt 2: Server-Side YOLOv11-cls (ImageNet Pre-trained)**
    * **Approach:** We shifted to a server-side model using `YOLOv11-cls` (classification variant) via a FastAPI endpoint. This offered more control and computational power.
    * **Outcome:** As `YOLOv11-cls` was pre-trained on the ImageNet dataset, it still classified images into 1000 broad categories (e.g., "container," "bottle," "utensil"), not specific waste types. While a robust backbone, it still suffered from the same granularity problem as `CocoSsd` for our specific domain. Fine-tuning on a custom waste dataset was required but time-prohibitive within the hackathon.
    * **Lesson Learned:** Server-side models are powerful, but require domain-specific training data to achieve high accuracy in niche areas like waste classification. Training a custom, highly granular model within hackathon constraints is extremely challenging.

3.  **Breakthrough: Google Gemini API (Current Solution)**
    * **Approach:** Recognizing the time constraints for custom model training, we pivoted to leveraging the **Google Gemini API's multimodal capabilities** (specifically `gemini-flash`). This allowed us to directly pass images and intelligent prompts to a cutting-edge Vision-Language Model (VLM).
    * **Outcome:** This was a game-changer! Gemini's advanced understanding allows it to provide highly accurate and nuanced descriptions of waste items directly from the image (e.g., "broken glass fragment," "ceramic coffee mug," "aluminum soda can"). This breakthrough eliminated the need for immediate, custom model fine-tuning and drastically improved the accuracy of our initial item identification.
    * **Lesson Learned:** For complex, nuanced classification or understanding tasks, leveraging powerful, pre-trained multimodal foundation models via API provides superior accuracy and significantly accelerates development, especially in time-limited environments like hackathons.

---

## 🏗️ How It Works (Architecture)

HomeBin AI employs a sophisticated, modular architecture designed for intelligence, scalability, and ease of maintenance. Our "AI Agent" orchestrated by n8n is at its core.

![Home Bin AI Architecture](https://raw.githubusercontent.com/veerarajank/homebin-ai/main/Home%20Bin%20AI.svg)


Workflow Breakdown:
Frontend (Bolt.new & Expo): The user interacts with our cross-platform mobile web app, capturing or uploading an image of a waste item.

Backend Orchestration (n8n AI Agent): The image data are sent to an n8n webhook. n8n acts as the "AI Agent," orchestrating the entire backend intelligence.
Multimodal AI Analysis (Google Gemini API): The n8n agent forwards the image and a carefully crafted prompt to the Google Gemini API. Gemini, with its advanced vision-language understanding, accurately identifies and describes the waste item in a highly specific way (e.g., "broken glass fragment," "ceramic coffee mug").
Hyperlocal Rule Retrieval (Qdrant Vector Store): The n8n agent then queries our Qdrant vector store (pre-populated with semantically rich, scraped local council recycling rules from Chelmsford, UK ) using the precise keywords from Gemini.
Formatted Response: The most relevant recycling rule is retrieved from Qdrant, formatted by n8n, and sent back to the app.
User Experience: The HomeBin AI app displays clear, accurate instructions on which bin to use.
Feedback Loop: Users can provide feedback (helpful/unhelpful), which is collected by a separate n8n workflow and stored, informing future AI model improvements and rule refinements.

🛠️ Technologies Used
Bolt.new: Primary rapid application development platform for our frontend and app logic.
Expo (React Native): Framework for building our universal, cross-platform mobile web application.
n8n: Our powerful open-source workflow automation tool, serving as the central "AI Agent" for backend orchestration and data flow.
Google Gemini API : Cutting-edge multimodal AI for highly accurate image analysis and specific item identification.
Qdrant: High-performance vector database used for Retrieval-Augmented Generation (RAG) to store and semantically query hyperlocal recycling rules.
Caddy: Modern, open-source web server acting as a reverse proxy for reliable and secure public access to our n8n and Qdrant services hosted on-prem server.
Python (requests, BeautifulSoup, Sentence Transformers): Used for the initial data scraping of local council recycling websites (e.g., from Chelmsford, UK) and preparing data for Qdrant.
Node.js: Backend runtime environment utilized within n8n.

🚀 Getting Started (How to Run HomeBin AI)
To get HomeBin AI up and running, you'll need to set up the backend services and then run the Expo frontend.

1. Backend Services (n8n & Qdrant via Caddy on-prem Server)

Prerequisites:

Docker and Docker Compose installed.
A public IP address or domain name configured to point to on-prem server.
Google Gemini API Key.
Qdrant API Key (if using a cloud Qdrant, otherwise not needed for local).
(Optional) Basic understanding of Caddy configuration.

Setup:

n8n folder inside this repo having workflow.

Configure Environment Variables: Create a .env file in the root of your backend directory (where your docker-compose.yml for n8n/Qdrant/Caddy would be, or similar setup) with:
Code snippet

# For n8n to connect to Gemini
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# For n8n to connect to Qdrant
QDRANT_HOST=http://localhost:6333 # If Qdrant is running locally via Docker
# If Qdrant is cloud hosted, use its public URL and API key
# QDRANT_HOST=[https://your-qdrant-instance.cloud](https://your-qdrant-instance.cloud)
# QDRANT_API_KEY=your_qdrant_cloud_api_key
Start Qdrant (and Populating Data):
Run Qdrant via Docker: docker run -p 6333:6333 qdrant/qdrant
Populate Qdrant: Run your Python scraping script (scrape_chelmsford.py and any other data ingestion scripts) to scrape local council data (e.g., specifically for chelmsford, UK) and ingest it into your running Qdrant instance. Ensure the QDRANT_HOST in your Python script matches where Qdrant is running.

Configure Caddy: Ensure your Caddyfile is correctly configured to proxy requests for n8n's webhooks and Qdrant's API endpoints to your local Docker containers. Example Caddyfile Snippet:
Code snippet

your.homebinai.domain {
    reverse_proxy /webhook/* http://localhost:5678
    reverse_proxy /qdrant-api/* http://localhost:6333
    # You might need more specific paths for Qdrant
}

Start n8n:
Run n8n via Docker. docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
Import Workflows: Access your n8n instance (usually http://localhost:5678). Import the two n8n workflows (image_analysis_workflow.json and feedback_collection_workflow.json) provided in this repo's n8n_workflows directory.
Activate Workflows: Ensure both workflows are Active.
Copy Webhook URLs: Get the final public Webhook URLs for both the image analysis and feedback collection workflows from within n8n. These are the URLs your Expo app will call, accessible via Caddy (e.g., https://your.homebinai.domain/webhook/xxxxxxxx-xxxx-...).

2. Frontend (Expo Web App)

Access the Deployed App:
HomeBin AI is deployed as a web application via Expo hosting. You can access it directly at: https://homebin-ai--acgno687s4.expo.app/
Running Locally (for development/testing):
Navigate to Frontend Directory:
Bash

cd frontend/homebin-ai # Assuming your Expo project is here
Install Dependencies:
Bash

npm install
Update n8n Webhook URLs: In the frontend code, locate where the n8n webhook URLs are configured (e.g., in a config.js or directly in the component that makes the fetch call) and update them to your public Caddy-fronted n8n webhook URLs.
Start Expo:
Bash

npx expo start --web
This will open the app in your browser. For iOS/Android testing, use npx expo start and scan the QR code with the Expo Go app.
🎥 Demo Video
Watch a live demonstration of HomeBin AI in action, showcasing its accurate classification and instant recycling guidance:

[YOUR_DEMO_VIDEO_YOUTUBE_URL_HERE]

🔮 Future Enhancements
Cost-Effective Scalability: While Gemini API provides high accuracy, for very high-volume, real-time inferencing, exploring smaller, specialized multimodal models or fine-tuning more efficient open-source VLMs (like LLaVA or MiniGPT-4) on custom waste datasets could provide a more cost-effective solution for future scaling, potentially deploying them on serverless functions.
Gemini Prompt Refinement: Continuously optimize the prompts sent to Gemini based on user feedback to further enhance identification accuracy and specificity for edge cases.
Expanded Data Coverage: Integrate recycling rules from more local councils globally (e.g., beyond Broomfield, UK) for broader geographical coverage.
Gamification & Community Features: Introduce challenges, leaderboards, and a community forum to encourage better recycling habits.
Personalized Reminders: Smart notifications for collection days or specific item drop-offs.
Offline Mode: Enable basic functionality without an internet connection for core item classification.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Built with 💚 for The World's Largest Hackathon by Bolt!

<img src="https://www.google.com/search?q=https://devpost-challenge-network-prod.s3.amazonaws.com/uploads/challenge/uploaded_gallery_image/image/6215/Devpost_builtwith_badge_2024.png" alt="Built with Bolt.new" width="200"/>
