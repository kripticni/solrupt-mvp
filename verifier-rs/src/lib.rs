//! Arena verifier core — pure: `verify(session, room, exploit) -> Verdict`.
//! One interface for every room (19 §4.2); per-room logic = predicates only.
//! Fail-closed: unknown room or harness error is `Err`, never a false green.

use thiserror::Error;

/// Verdict returned to the API layer (rendered, never the solver internals).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Verdict {
    pub pass: bool,
    pub state_diff: String,
    pub logs: String,
    pub code_hash: [u8; 32],
}

/// Threat-named errors (19 §5 taxonomy, verifier side).
#[derive(Debug, Error)]
pub enum VerifyError {
    #[error("unknown room: {0}")]
    RoomMissing(String),
    #[error("harness unavailable (unbuilt LiteSVM path)")]
    HarnessUnavailable,
}

/// Verify one exploit against one room.
///
/// Session isolation (fresh keypairs/program IDs, LiteSVM instance per call)
/// is constructed here once Diff 3 lands the LiteSVM harness. Until then this
/// is an explicit, loud unavailability — calling it green would be a lie.
pub fn verify(_session: &str, room: &str, _exploit: &[u8]) -> Result<Verdict, VerifyError> {
    let _ = room;
    Err(VerifyError::HarnessUnavailable)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_room_is_fail_closed_not_green() {
        let r = verify("s", "no-such-room", b"x");
        assert!(r.is_err(), "unknown room must never verify green");
    }
}
