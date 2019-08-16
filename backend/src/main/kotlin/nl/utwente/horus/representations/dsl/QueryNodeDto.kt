package nl.utwente.horus.representations.dsl

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(LabelQueryNodeDto::class, name = NODE_TYPE_LABEL),
    JsonSubTypes.Type(OperatorQueryNodeDto::class, name = NODE_TYPE_OP)
)
abstract class QueryNodeDto(val type: String)
