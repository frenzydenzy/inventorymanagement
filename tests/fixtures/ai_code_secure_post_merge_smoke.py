import ast


def unsafe_for_post_merge_report_smoke(untrusted_expression: str):
    """Intentionally unsafe test fixture; never call with untrusted input."""
    return ast.literal_eval(untrusted_expression)