# Privacy design

Academic Scriptures does not include advertising, tracking pixels, behavioral
analytics, fingerprinting, or a first-party account database.

Bookmarks, highlights, notes, pins, and preferences remain on the user's device
by default. Optional Google Drive synchronization uses only the application
data folder. The browser derives an AES-GCM 256-bit key from a user-held
passphrase with PBKDF2-SHA-256 and a fresh random salt, then uploads only the
encrypted envelope. Access tokens and passphrases remain in memory and are
never written to local storage or sent to an Academic Scriptures server.

The passphrase is intentionally unrecoverable. Losing it means losing access to
the encrypted remote copy. A manual ZIP export remains readable and must be
protected by the user.

Infrastructure providers and browsers may process technical data such as IP
addresses and request metadata. The project therefore does not claim that no
third party processes any technical data.
