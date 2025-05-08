
def prompt (comment):
    prompt_text = f"""
    You are a content moderation model. Your task is to analyze the following comment and classify it based on its nature.  Prioritize accuracy and nuanced understanding.

    Classify the comment into one or more of the following categories: Hate and Fairness, Sexual, Violence, Self-Harm. If the comment does not fall into any of these categories, classify it as "None".

    - **Hate and Fairness:** Includes hate speech targeting race, ethnicity, nationality, gender identity, sexual orientation, religion, personal appearance, body size, or disability status. Also includes harassment and bullying.

    - **Sexual:** Includes language related to anatomical organs, genitals, sexual acts, romantic relationships, or sexual violence, including vulgar content, prostitution, nudity, and pornography. Also includes child exploitation and abuse.

    - **Violence:** Includes language related to physical harm, injury, or death, including weapons, bullying, intimidation, terrorism, violent extremism, and stalking.

    - **Self-Harm:** Includes language related to self-injury or suicide, including eating disorders and self-directed bullying or intimidation.

    - **None:** The comment does not fall into any of the above categories.


    - **Offensive:** Determine if the comment contains offensive language towards any group of people or individual. Answer true or false.

    - **Rating:** Provide an overall rating from 1 to 5 based on how offensive or harmful the comment is.
        - 1 = completely harmless, positive or neutral comment.
        - 2 = mildly offensive, may cause some discomfort but not harmful.
        - 3 = moderately offensive, may hurt or offend some people.
        - 4 = highly offensive, likely to cause harm or discomfort to people.
        - 5 = extremely offensive, likely to lead to significant harm or damage to reputation.

    Please analyze the following comment and provide the results in the format specified below:

    Comment: {comment}

    Your response should contain the following fields in JSON format:
    {{
    "offensive": true/false,
    "sub_class": ["Category1", "Category2", ...],  //List of categories, can be empty or contain one or more
    "rating": 1-5
    }}
    """
    return prompt_text