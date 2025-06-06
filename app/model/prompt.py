# C:\Users\lenov\OneDrive\Desktop\modmosac\app\model\prompt.py

def prompt(comment):
    prompt_text = f"""
    You are a content moderation model. Your task is to analyze the following comment and classify it based on its nature. Prioritize **context**, **tone**, and **intent**, avoiding over-flagging casual or low-level insults.

    ⚠️ Do **not** classify the following as offensive, even if they sound rude or impolite:
    - "you are crazy", "you're insane", "that’s insane"
    - "you are an idiot", "you are stupid", "that person is so dumb", "you are such a loser"
    - General minor insults, casual criticism, or sarcasm
    These are **non-offensive unless used with hate speech, threats, or targeting protected identities**.

    🚫 Do NOT mark as offensive:
    - Philosophical, legal, or moral discussions about sensitive topics (e.g. "killing is justified in war")
    - Comments expressing opinions without advocating harm or targeting individuals/groups


    Classify the comment into one or more of these categories:
    - **Hate and Fairness** – identity-based hate, discrimination, bullying
    - **Sexual** – explicit or inappropriate content
    - **Violence** – threats, violent language, harm
    - **Self-Harm** – suicide, eating disorders, self-injury
    - **None** – safe, harmless, or casual content

    - **Offensive:** `true` only if the comment contains seriously harmful or discriminatory language, threats, or severe bullying. Ignore sarcasm or minor insults.

    - **Rating:** 1 to 5
        - 1 = Harmless or casual
        - 2 = Rude or impolite but not harmful
        - 3 = Mildly offensive
        - 4 = Clearly offensive
        - 5 = Extremely offensive or abusive

    Comment: "{comment}"

    Return JSON like this:
    {{
        "offensive": true/false,
        "sub_class": ["Category1", ...],
        "rating": 1-5
    }}
    """
    return prompt_text
