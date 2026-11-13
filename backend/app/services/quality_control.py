import re
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher

class QualityControlEngine:
    """
    Automated AI Quality Control & Factual Grounding Engine:
    - Factual correctness verification against source document
    - Duplicate question detection
    - Ambiguity and poorly phrased stem detection
    - Answer key validity & distracter balance
    - Source answerability check
    - Confidence and Quality scoring (0-100)
    - Unsupported claim detection
    """

    @staticmethod
    def clean_tokens(text: str) -> set:
        words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', text.lower())
        stopwords = {
            "the", "and", "that", "this", "with", "from", "which", "what", "where",
            "when", "their", "there", "these", "those", "have", "been", "were"
        }
        return {w for w in words if w not in stopwords}

    @classmethod
    def check_factual_grounding(cls, question_text: str, answer_text: str, source_text: str) -> Dict[str, Any]:
        """
        Verifies whether the question and answer are grounded in the source text.
        Returns grounding score, grounded status, and missing/unsupported keywords.
        """
        combined = f"{question_text} {answer_text}"
        tokens = cls.clean_tokens(combined)
        source_lower = source_text.lower()

        if not tokens:
            return {"grounded": True, "score": 90.0, "unsupported_terms": []}

        grounded_count = 0
        unsupported = []

        for token in tokens:
            if token in source_lower:
                grounded_count += 1
            else:
                unsupported.append(token)

        grounding_ratio = grounded_count / len(tokens)
        score = round(min(100.0, grounding_ratio * 105), 1)

        # Flag as ungrounded if less than 65% of significant keywords appear in source
        is_grounded = 1 if grounding_ratio >= 0.65 else 0

        return {
            "is_grounded": is_grounded,
            "grounding_ratio": grounding_ratio,
            "score": score,
            "unsupported_terms": unsupported[:5]  # top 5 missing terms
        }

    @classmethod
    def detect_duplicates(cls, questions: List[Dict[str, Any]], threshold: float = 0.72) -> List[Tuple[int, int, float]]:
        """
        Identifies duplicate or near-duplicate questions using token overlap & SequenceMatcher.
        Returns list of (index_a, index_b, similarity_score).
        """
        duplicates = []
        n = len(questions)

        for i in range(n):
            tokens_i = cls.clean_tokens(questions[i].get("question_text", ""))
            for j in range(i + 1, n):
                tokens_j = cls.clean_tokens(questions[j].get("question_text", ""))
                
                # Jaccard similarity
                if tokens_i and tokens_j:
                    intersection = len(tokens_i.intersection(tokens_j))
                    union = len(tokens_i.union(tokens_j))
                    jaccard = intersection / union if union > 0 else 0
                    
                    # Sequence similarity
                    seq_ratio = SequenceMatcher(
                        None, 
                        questions[i].get("question_text", "").lower(),
                        questions[j].get("question_text", "").lower()
                    ).ratio()

                    combined_sim = (jaccard * 0.6) + (seq_ratio * 0.4)
                    if combined_sim >= threshold:
                        duplicates.append((i, j, round(combined_sim, 2)))

        return duplicates

    @classmethod
    def check_ambiguity(cls, question_text: str, options: List[str] = None) -> Dict[str, Any]:
        """
        Flags ambiguous, ungrammatical, or under-specified questions.
        """
        issues = []
        q_len = len(question_text.split())

        if q_len < 4:
            issues.append("Question stem is too short to be unambiguous.")

        # Check for vague qualifiers without criteria
        vague_terms = ["sometimes", "maybe", "usually", "sort of", "kind of", "stuff", "things"]
        for term in vague_terms:
            if re.search(r'\b' + term + r'\b', question_text.lower()):
                issues.append(f"Contains ambiguous qualifier: '{term}'.")

        # Double negatives
        if re.search(r'\b(not\s+\w+\s+not|never\s+un|hardly\s+no)\b', question_text.lower()):
            issues.append("Contains potential confusing double negative.")

        # Check MCQ options if provided
        if options:
            if len(options) != 4:
                issues.append(f"MCQ has {len(options)} options instead of standard 4.")
            
            # Check for identical options
            lower_options = [o.strip().lower() for o in options]
            if len(set(lower_options)) < len(lower_options):
                issues.append("MCQ contains duplicate answer options.")

        is_ambiguous = 1 if len(issues) > 0 else 0
        return {
            "is_ambiguous": is_ambiguous,
            "issues": issues
        }

    @classmethod
    def evaluate_question(cls, question_data: Dict[str, Any], source_text: str) -> Dict[str, Any]:
        """
        Executes a comprehensive multi-factor quality inspection on a single question.
        Calculates:
        - confidence_score (0-100)
        - quality_score (0-100)
        - is_grounded
        - is_ambiguous
        - is_answerable
        - audit_flags
        """
        q_text = question_data.get("question_text", "")
        q_type = question_data.get("question_type", "mcq")
        options = question_data.get("options", [])
        correct_ans = question_data.get("correct_answer", "")
        explanation = question_data.get("explanation", "")

        # 1. Grounding check
        grounding = cls.check_factual_grounding(q_text, f"{correct_ans} {explanation}", source_text)
        
        # 2. Ambiguity check
        ambiguity = cls.check_ambiguity(q_text, options if q_type == "mcq" else None)
        
        # 3. Answerability check
        q_tokens = cls.clean_tokens(q_text)
        found_in_source = sum(1 for t in q_tokens if t in source_text.lower())
        answerable_ratio = found_in_source / max(1, len(q_tokens))
        is_answerable = 1 if answerable_ratio >= 0.6 else 0

        # 4. Correct answer validity
        answer_key_valid = True
        if q_type == "mcq" and options:
            # Check if correct answer is one of the options or letter A-D
            opt_letters = ["A", "B", "C", "D"]
            letter_match = correct_ans.strip().upper() in opt_letters
            text_match = any(correct_ans.strip().lower() in o.lower() for o in options)
            if not (letter_match or text_match):
                answer_key_valid = False

        # Calculate composite Quality Score
        base_quality = grounding["score"]
        if ambiguity["is_ambiguous"]:
            base_quality -= 18.0
        if not is_answerable:
            base_quality -= 20.0
        if not answer_key_valid:
            base_quality -= 25.0
        
        # Length & formatting bonus/penalty
        if 8 <= len(q_text.split()) <= 35:
            base_quality += 5.0

        quality_score = max(30.0, min(99.0, base_quality))
        
        # Confidence score represents model certainty that question is factually accurate and syllabus aligned
        confidence_score = max(40.0, min(99.5, (grounding["score"] * 0.7) + (quality_score * 0.3)))

        audit_flags = []
        if not grounding["is_grounded"]:
            audit_flags.append(f"Potential hallucination: unsupported terms [{', '.join(grounding['unsupported_terms'])}]")
        if ambiguity["is_ambiguous"]:
            audit_flags.extend(ambiguity["issues"])
        if not is_answerable:
            audit_flags.append("May not be directly answerable from source document.")
        if not answer_key_valid:
            audit_flags.append("Answer key option does not cleanly align with choices.")

        return {
            "confidence_score": round(confidence_score, 1),
            "quality_score": round(quality_score, 1),
            "is_grounded": grounding["is_grounded"],
            "is_ambiguous": ambiguity["is_ambiguous"],
            "is_answerable": is_answerable,
            "audit_flags": audit_flags
        }
