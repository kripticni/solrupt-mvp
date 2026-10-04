//! LOCAL SHIM. See ../README.SHIM (temporary, remove with platform cargo >= 1.85).
//!
//! Implements exactly the API surface blake3 1.8.7 uses: the `new!` macro
//! producing a token with an associated `get() -> bool`. Detection is
//! conservatively `false` on every target: callers fall back to portable code,
//! which is correct everywhere and merely slower on x86 hosts. This is the
//! fail-safe direction (never claims a feature that is absent).

/// Define a CPU-feature token: `cpufeatures::new!(name, "feat", ...)`.
#[macro_export]
macro_rules! new {
    ($token:ident, $($feat:expr),*) => {
        /// Compile-time-known-absent feature token (see crate docs).
        pub struct $token;
        impl $token {
            /// Always `false`: portable fallback path, correct on all targets
            /// including BPF (where the real crate refuses to compile).
            #[inline(always)]
            pub fn get() -> bool {
                false
            }
        }
    };
}
