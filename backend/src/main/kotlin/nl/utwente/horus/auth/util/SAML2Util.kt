package nl.utwente.horus.auth.util

import org.pac4j.saml.credentials.SAML2Credentials

/**
 * Miscellaneous utilities for SAML2 authentication.
 */
class SAML2Util {

    companion object {

        /**
         * Extract all SAML2 credential attributes to a HashMap with attribute name as key and
         * first attribute value as value.
         * @param attributes SAML2 attributes list.
         * @return map of attributes.
         */
        fun credentialAttributesToMap(attributes: List<SAML2Credentials.SAMLAttribute>): HashMap<String, String> {
            val map = HashMap<String, String>()
            attributes.forEach { attr ->
                if (attr.attributeValues != null && attr.attributeValues.size > 0) {
                    map[attr.name] = attr.attributeValues[0]
                }
             }
            return map
        }

    }
}