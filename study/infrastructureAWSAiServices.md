---
title: AWS AI Services
permalink: /study/infrastructureAWSAiServices
---



Foundation Model vs LLM
<table class="study-table">
  <thead>
    <tr>
      <th>Dimension</th>
      <th>Foundation Model</th>
      <th>Large Language Model (LLM)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>A large, general-purpose model trained on broad data that can be adapted to many tasks</td>
      <td>A foundation model specialized in language (text / tokens)</td>
    </tr>
    <tr>
      <td><strong>Scope</strong></td>
      <td>Multimodal or single-modal (text, image, audio, video, code)</td>
      <td>Language-focused (text, code, sometimes multimodal extensions)</td>
    </tr>
    <tr>
      <td><strong>Input / Output</strong></td>
      <td>Text, images, audio, video, embeddings</td>
      <td>Tokens (text / code), sometimes images via adapters</td>
    </tr>
    <tr>
      <td><strong>Core Objective</strong></td>
      <td>Learn general representations</td>
      <td>Learn next-token prediction in language</td>
    </tr>
    <tr>
      <td><strong>Training Data</strong></td>
      <td>Massive, diverse, often multimodal</td>
      <td>Massive text and code corpora</td>
    </tr>
    <tr>
      <td><strong>Training Task</strong></td>
      <td>Self-supervised learning (varies by modality)</td>
      <td>Autoregressive next-token prediction</td>
    </tr>
    <tr>
      <td><strong>Adaptation</strong></td>
      <td>Fine-tuning, adapters, prompting, RLHF</td>
      <td>Prompting, instruction tuning, RLHF</td>
    </tr>
    <tr>
      <td><strong>Typical Use</strong></td>
      <td>Vision, speech, language, search, embeddings</td>
      <td>Chatbots, coding assistants, reasoning, Q&amp;A</td>
    </tr>
    <tr>
      <td><strong>Output Style</strong></td>
      <td>Depends on task</td>
      <td>Sequential token generation</td>
    </tr>
    <tr>
      <td><strong>Examples</strong></td>
      <td>CLIP, DINO, Whisper, SAM</td>
      <td>GPT-4, LLaMA, Claude, Mistral</td>
    </tr>
  </tbody>
</table>




Epochs – One epoch is one cycle through the entire dataset. Multiple intervals complete a batch, and multiple batches eventually complete an epoch. Multiple epochs are run until the accuracy of the model reaches an acceptable level, or when the error rate drops below an acceptable level.

Learning rate – The amount that values should be changed between epochs. As the model is refined, its internal weights are being nudged and error rates are checked to see if the model improves. A typical learning rate is 0.1 or 0.01, where 0.01 is a much smaller adjustment and could cause the training to take a long time to converge, whereas 0.1 is much larger and can cause the training to overshoot. It is one of the primary hyperparameters that you might adjust for training your model. Note that for text models, a much smaller learning rate (5e-5 for BERT) can result in a more accurate model.

Batch size – The number of records from the dataset that is to be selected for each interval to send to the GPUs for trainin


Transformer models use a self-attention mechanism and implement contextual embeddings

Transformer models are a type of neural network architecture designed to handle sequential data, such as language, in an efficient and scalable way. They rely on a mechanism called self-attention to process input data, allowing them to understand and generate language effectively. Self-attention allows the model to weigh the importance of different words in a sentence when encoding a particular word. This helps the model capture relationships and dependencies between words, regardless of their position in the sequence.

Transformer models use self-attention to weigh the importance of different words in a sentence, allowing them to capture complex dependencies. Positional encodings provide information about word order, and the encoder-decoder architecture enables effective processing and generation of sequences. This makes transformers highly effective for tasks like language translation, text generation, and more.

Temperature is a value between 0 and 1, and it regulates the creativity of the model's responses. Use a lower temperature if you want more deterministic responses, and use a higher temperature if you want creative or different responses for the same prompt on Amazon Bedrock.

## LLM

On a high level how LLM works:

```
@startuml
title Chat-style LLM interaction (high level) with example + optional streaming

actor User
participant "Chat UI\n(Frontend)" as UI
participant "Controller\n(ChatGPT backend)" as C
participant "Tokenizer" as T
participant "LLM Model" as M
participant "Sampler\n(Top-P)" as S

User -> UI: "Why is the sky blue?"
UI -> C: raw text

C -> T: tokenize(text)
T --> C: prompt_token_ids

note over C
Tokenizer runs ONCE per user message.
The loop below is NOT "user asks again".
It is "generate ONE output token per iteration".
end note

loop generate answer token-by-token (many iterations)
  C -> M: tokens_so_far
  M --> C: next-token probabilities

  C -> S: probabilities + top_p
  S --> C: chosen next_token_id

  C -> C: append chosen token to tokens_so_far

  opt streaming enabled
    C --> UI: stream partial text\n(e.g. "Because sunlight...")
    UI --> User: display partial text
  end

  note over C
  Stop when:
  - EOS token generated
  - stop sequence matched
  - max output tokens reached
  - user/app cancels
  end note
end

@enduml
```




Influences the percentage of most-likely candidates that the model considers for the next token

Top P represents the percentage of most likely candidates that the model considers for the next token. Choose a lower value to decrease the size of the pool and limit the options to more likely outputs. Choose a higher value to increase the size of the pool and allow the model to consider less likely outputs.


Using a RAG approach is the least costly and most efficient solution for providing up-to-date and relevant responses. In this approach, you convert all product catalog PDFs into a searchable knowledge base. When a customer query comes in, the RAG framework first retrieves the most relevant pieces of information from this knowledge base and then uses an LLM to generate a coherent response based on the retrieved context. This method does not require re-training the model or modifying every incoming query with large datasets, making it significantly more cost-effective. It ensures that the chatbot always has access to the most recent information without needing expensive updates or processing every time.


The company should use Domain Adaptation Fine-Tuning, which involves fine-tuning the model on domain-specific data to adapt its knowledge to that particular domain

Domain Adaptation Fine-Tuning is an effective approach because it takes a pre-trained Foundation Model and further adjusts its parameters using domain-specific data. This process helps the model learn the nuances, terminology, and context specific to the domain, enhancing its ability to generate accurate and relevant outputs in that field. Fine-tuning allows the model to specialize while retaining the general knowledge acquired during initial training.

The company should use Continued Pre-Training, which involves further training the model on a large corpus of domain-specific data, enhancing its ability to understand domain-specific terms, jargon, and context

Continued Pre-Training is another appropriate strategy for making a Foundation Model an expert in a specific domain. By pre-training the model on a large dataset specifically from the target domain, the model can learn the distinct characteristics, language patterns, and specialized knowledge relevant to that domain. This approach effectively builds upon the model's existing knowledge, enhancing its domain expertise without starting training from scratch.


Bidirectional Encoder Representations from Transformers (BERT)

Embedding models are algorithms trained to encapsulate information into dense representations in a multi-dimensional space. Data scientists use embedding models to enable ML models to comprehend and reason with high-dimensional data.

BERT is the correct answer because it is specifically designed to capture the contextual meaning of words by looking at both the words that come before and after them (bidirectional context). Unlike older models that use static embeddings, BERT creates dynamic word embeddings that change depending on the surrounding text, allowing it to understand the different meanings of the same word in various contexts. This makes BERT ideal for tasks that require understanding the nuances and subtleties of language.

AWS AI Service
Transcribe
Comprehend
Recoknigtion
