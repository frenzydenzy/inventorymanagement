def unsafe_evaluate_for_security_scanner(untrusted_expression: str):
    """Intentionally unsafe fixture; do not call with untrusted input."""
    return eval(untrusted_expression)