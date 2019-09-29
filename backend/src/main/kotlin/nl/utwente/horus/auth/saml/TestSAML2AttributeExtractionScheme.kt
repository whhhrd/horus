package nl.utwente.horus.auth.saml

class TestSAML2AttributeExtractionScheme: SAML2AttributeExtractionScheme {
    override fun getUserIdAttributeName(): String {
        return "urn:oid:0.9.2342.19200300.100.1.1"
    }

    override fun getMailAttributeName(): String {
        return "urn:oid:0.9.2342.19200300.100.1.3"
    }

    override fun getGivenNameAttributeName(): String {
        return "urn:oid:2.5.4.42"
    }

    override fun getSurNameAttributeName(): String {
        return "urn:oid:2.5.4.4"
    }
}