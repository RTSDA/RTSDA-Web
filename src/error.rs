use lettre::transport::smtp::Error as SmtpError;
use lettre::error::Error as LettreError;
use lettre::address::AddressError;
use std::error::Error as StdError;
use std::fmt;

#[derive(Debug)]
pub enum Error {
    Smtp(SmtpError),
    Lettre(LettreError),
    Address(AddressError),
    Config(&'static str),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Smtp(e) => write!(f, "SMTP error: {}", e),
            Error::Lettre(e) => write!(f, "Lettre error: {}", e),
            Error::Address(e) => write!(f, "Address error: {}", e),
            Error::Config(msg) => write!(f, "Configuration error: {}", msg),
        }
    }
}

impl StdError for Error {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            Error::Smtp(e) => Some(e),
            Error::Lettre(e) => Some(e),
            Error::Address(e) => Some(e),
            Error::Config(_) => None,
        }
    }
}

impl From<SmtpError> for Error {
    fn from(err: SmtpError) -> Self {
        Error::Smtp(err)
    }
}

impl From<LettreError> for Error {
    fn from(err: LettreError) -> Self {
        Error::Lettre(err)
    }
}

impl From<AddressError> for Error {
    fn from(err: AddressError) -> Self {
        Error::Address(err)
    }
}

pub type Result<T> = std::result::Result<T, Error>;
