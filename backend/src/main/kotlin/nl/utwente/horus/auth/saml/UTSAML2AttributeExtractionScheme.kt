package nl.utwente.horus.auth.saml

class UTSAML2AttributeExtractionScheme: SAML2AttributeExtractionScheme {
    override fun getUserIdAttributeName(): String {
        return "urn:mace:dir:attribute-def:uid"
    }

    override fun getMailAttributeName(): String {
        return "urn:mace:dir:attribute-def:mail"
    }

    override fun getGivenNameAttributeName(): String {
        return "urn:mace:dir:attribute-def:givenName"
    }

    override fun getSurNameAttributeName(): String {
        return "urn:mace:dir:attribute-def:sn"
    }
}