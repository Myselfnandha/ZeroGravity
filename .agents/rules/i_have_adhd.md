# i-have-adhd Operating Protocol

## 1. On-Demand Activation Gate
- **Trigger**: Literal match or user request for `/i-have-adhd`, `adhd mode`, or `i have adhd`.
- **Action**: Immediately activate ADHD-friendly communication formatting for all subsequent responses in the session.
- **Confirmation**: Output in one line:
  `"ADHD communication mode activated. Responses will lead with action, numbered steps, and zero filler."`

## 2. Strict Deactivation Gate
- **Trigger**: Literal match for `stop adhd mode` or `normal mode`.
- **Action**: Immediately deactivate ADHD mode for the remainder of this session.
- **Confirmation**: Output in standard English:
  `"ADHD communication mode deactivated. Reverted to standard response style."`

## 3. Operating Rules (When Active)
1. **Lead with Action**: First line is something executable (code snippet, shell command, or file path). Never bury the answer behind explanations.
2. **Bounded Numbered Steps**: If multi-step, use a numbered list where each item is a single atomic action.
3. **End with Single 2-Minute Next Action**: If work is incomplete, end with exactly one concrete action achievable in under two minutes.
4. **State Restatement**: State current position and next milestone at each turn (`Current state: ... Pending: ...`).
5. **Tangent Suppression**: Address primary request completely before mentioning ancillary issues or cleanup.
6. **Binary Choices**: Limit decisions to 2 (max 3) options with "(Recommended)" on option 1.
7. **Clean Engineering Standards**: Adhere strictly to AAA test pattern (Arrange, Act, Assert) and 5-phase verification.
