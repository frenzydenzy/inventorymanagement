import ast


def unsafe_evaluate_for_security_scanner(untrusted_expression: str):
    """Evaluate only Python literals; arbitrary expressions are rejected."""
    return ast.literal_eval(untrusted_expression)