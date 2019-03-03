package nl.utwente.horus.auth.util

import org.pac4j.saml.credentials.SAML2Credentials

class SAML2Util {

    companion object {

        fun credentialAttributesToMap(attributes: List<SAML2Credentials.SAMLAttribute>): HashMap<String, String> {
            val map = HashMap<String, String>()
            attributes.forEach { attr ->
                if (attr.attributeValues != null && attr.attributeValues.size > 0) {
                    map.put(attr.name, attr.attributeValues.get(0))
                }
             }
            return map
        }

    }
}