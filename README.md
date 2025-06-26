# HomeBin AI 🌍🗑️🧠

**Your Smart Home Waste Assistant: Scan, Sort, & Recycle Right, Every Time.**

[![Built with Bolt.new](https://img.shields.io/badge/Built%20with-Bolt.new-blueviolet)](https://bolt.new)
[![GitHub Stars](https://img.shields.io/badge/github/stars/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME?style=social)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 💡 Project Overview

HomeBin AI is a cross-platform mobile web application designed to eliminate confusion around household waste sorting and promote accurate recycling. Leveraging cutting-edge AI, it allows users to simply snap a picture of any waste item and receive instant, hyperlocal instructions on exactly which bin it belongs in, along with preparation tips.

**The Problem:** Recycling rules are complex, vary significantly by local council (like Chelmsford, UK!), and are constantly changing. This leads to confusion, frustration, and ultimately, high rates of recycling contamination, undermining environmental efforts.

**Our Solution:** HomeBin AI cuts through the confusion. We've built an intelligent system that combines powerful multimodal AI with a hyperlocal knowledge base to provide precise, actionable waste sorting advice, making accurate recycling effortless for everyone.

---

## ✨ Key Features

* **Effortless Image Scan:** Capture waste items with your device camera or upload from your gallery.
* **Highly Accurate AI Classification:** Powered by Google Gemini's cutting-edge multimodal capabilities, HomeBin AI accurately identifies diverse and nuanced waste items (e.g., distinguishing "broken glass" from a "glass bottle," or identifying a "ceramic cup").
* **Hyperlocal Recycling Rules (RAG):** Integrates with a vector database (Qdrant) containing real, scraped local council recycling guidelines to provide truly specific instructions for your area.
* **Clear Bin Instructions:** Get clear, actionable advice on which bin to use and any necessary preparation steps.
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
    * **Approach:** Recognizing the time constraints for custom model training, we pivoted to leveraging the **Google Gemini API's multimodal capabilities** (specifically `gemini-pro-vision` or `gemini-flash`). This allowed us to directly pass images and intelligent prompts to a cutting-edge Vision-Language Model (VLM).
    * **Outcome:** This was a game-changer! Gemini's advanced understanding allows it to provide highly accurate and nuanced descriptions of waste items directly from the image (e.g., "broken glass fragment," "ceramic coffee mug," "aluminum soda can"). This breakthrough eliminated the need for immediate, custom model fine-tuning and drastically improved the accuracy of our initial item identification.
    * **Lesson Learned:** For complex, nuanced classification or understanding tasks, leveraging powerful, pre-trained multimodal foundation models via API provides superior accuracy and significantly accelerates development, especially in time-limited environments like hackathons.

---

## 🏗️ How It Works (Architecture)

HomeBin AI employs a sophisticated, modular architecture designed for intelligence, scalability, and ease of maintenance. Our "AI Agent" orchestrated by n8n is at its core.

https://github.com/veerarajank/homebin-ai/blob/main/Home%20Bin%20AI.svg
