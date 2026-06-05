import json
import re


def _strip_markdown_fences(response_text: str) -> str:
    cleaned = re.sub(r"```(?:json)?\s*", "", response_text).strip()
    return cleaned.rstrip("`").strip()


def _close_truncated_json(text: str) -> str:
    """Best-effort repair when the model stops mid-JSON."""
    start = text.find("{")
    if start == -1:
        return text
    fragment = text[start:]

    # Drop trailing partial key/value after the last complete comma.
    if fragment and fragment[-1] not in '}"],0123456789':
        cut_points = [fragment.rfind('",'), fragment.rfind('"},'), fragment.rfind('"],')]
        cut = max(cut_points)
        if cut > 0:
            fragment = fragment[: cut + 1]

    stack: list[str] = []
    in_string = False
    escape = False

    for char in fragment:
        if escape:
            escape = False
            continue
        if char == "\\" and in_string:
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if char == "{":
            stack.append("}")
        elif char == "[":
            stack.append("]")
        elif char in "}]" and stack and stack[-1] == char:
            stack.pop()

    suffix = ""
    if in_string:
        suffix += '"'
    suffix += "".join(reversed(stack))
    return fragment + suffix


def parse_llm_json(response_text: str) -> dict:
    """
    Safely parse JSON from an LLM response.
    Strips markdown fences before parsing.
    Falls back to regex extraction and truncated-json repair if direct parse fails.
    """
    cleaned = _strip_markdown_fences(response_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    repaired = _close_truncated_json(cleaned)
    if repaired != cleaned:
        try:
            return json.loads(repaired)
        except json.JSONDecodeError:
            pass

    raise ValueError(
        "Could not parse JSON from LLM response "
        f"(length={len(response_text)} chars).\n"
        f"First 500 chars:\n{response_text[:500]}"
    )
