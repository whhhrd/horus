package nl.utwente.horus.auth.saml

interface SAML2AttributeExtractionScheme {

    fun getUserIdAttributeName(): String

    fun getMailAttributeName(): String

    fun getGivenNameAttributeName(): String

    fun getSurNameAttributeName(): String

}