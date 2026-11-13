import re
from typing import Dict, Any, Tuple

class BloomsTaxonomyClassifier:
    """
    Classifies questions into the 6 cognitive domains of Bloom's Revised Taxonomy:
    1. Remember (Knowledge recall)
    2. Understand (Comprehension & translation)
    3. Apply (Execution & implementation)
    4. Analyze (Differentiation, organization, attribution)
    5. Evaluate (Appraisal, critique, judgment)
    6. Create (Synthesis, formulation, generation)
    """

    LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

    KEYWORDS = {
        "Remember": [
            "define", "list", "name", "state", "identify", "recall", "repeat", "who", "what is",
            "where", "when", "which of the following is", "recognize", "match", "label", "enumerate",
            "cite", "mention", "record"
        ],
        "Understand": [
            "explain", "describe", "summarize", "paraphrase", "interpret", "classify", "discuss",
            "give an example", "illustrate", "rephrase", "translate", "contrast broadly",
            "what does", "meaning of", "clarify", "differentiate between basic", "overview"
        ],
        "Apply": [
            "apply", "calculate", "compute", "solve", "implement", "demonstrate", "use",
            "operate", "execute", "show how", "determine the output", "modify", "practice",
            "simulate", "employ", "utilize", "find the value", "run"
        ],
        "Analyze": [
            "analyze", "distinguish", "differentiate", "examine", "compare and contrast", "investigate",
            "break down", "categorize", "deconstruct", "infer", "correlate", "discriminate",
            "why does", "what is the relationship", "structural difference", "root cause", "troubleshoot"
        ],
        "Evaluate": [
            "evaluate", "assess", "judge", "critique", "justify", "defend", "validate",
            "verify", "prioritize", "rate", "appraise", "which is more effective", "argue",
            "recommend", "weigh the pros and cons", "strengths and weaknesses", "trade-off"
        ],
        "Create": [
            "design", "create", "formulate", "construct", "develop", "propose", "synthesize",
            "generate", "devise", "compose", "plan an architecture", "integrate", "invent",
            "hypothesize", "architect", "draft an algorithm"
        ]
    }

    DESCRIPTIONS = {
        "Remember": "Retrieving, recognizing, and recalling relevant knowledge from long-term memory.",
        "Understand": "Constructing meaning from instructional messages, including interpreting and exemplifying.",
        "Apply": "Carrying out or using a procedure, formula, or method in a given situation.",
        "Analyze": "Breaking material into constituent parts and determining how they relate to one another.",
        "Evaluate": "Making judgments based on criteria and standards, checking critiques, or assessing trade-offs.",
        "Create": "Putting elements together to form a coherent whole or reorganizing elements into a new pattern."
    }

    BADGE_COLORS = {
        "Remember": "bg-blue-100 text-blue-800 border-blue-300",
        "Understand": "bg-teal-100 text-teal-800 border-teal-300",
        "Apply": "bg-emerald-100 text-emerald-800 border-emerald-300",
        "Analyze": "bg-amber-100 text-amber-800 border-amber-300",
        "Evaluate": "bg-purple-100 text-purple-800 border-purple-300",
        "Create": "bg-rose-100 text-rose-800 border-rose-300"
    }

    @classmethod
    def classify(cls, question_text: str, question_type: str = "mcq", marks: int = 1) -> Tuple[str, str]:
        """
        Determines the Bloom's Taxonomy level and provides a reasoning explanation.
        Returns: (blooms_level, explanation)
        """
        q_lower = question_text.lower().strip()

        # Score matches across keyword sets
        scores = {lvl: 0 for lvl in cls.LEVELS}

        for level, keywords in cls.KEYWORDS.items():
            for kw in keywords:
                # Match word boundaries
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, q_lower):
                    # Weight higher priority if keyword occurs near start of sentence
                    pos = q_lower.find(kw)
                    weight = 3 if pos < 20 else 1
                    scores[level] += weight

        # Heuristics based on question type and marks
        if marks >= 10:
            scores["Create"] += 2
            scores["Evaluate"] += 2
            scores["Analyze"] += 1
        elif marks >= 5:
            scores["Analyze"] += 2
            scores["Apply"] += 1
            scores["Evaluate"] += 1
        elif marks == 2:
            scores["Understand"] += 2
            scores["Remember"] += 1

        # Check max score
        best_level = max(scores, key=scores.get)

        # Default fallback if no keywords matched
        if scores[best_level] == 0:
            if question_type == "mcq":
                best_level = "Remember" if "which" in q_lower or "what" in q_lower else "Understand"
            elif marks <= 2:
                best_level = "Understand"
            elif marks <= 5:
                best_level = "Apply"
            else:
                best_level = "Analyze"

        explanation = (
            f"Classified under '{best_level}' because the question prompts students to "
            f"{cls.DESCRIPTIONS[best_level].lower()}"
        )

        return best_level, explanation
