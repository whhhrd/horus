package nl.utwente.horus.representations.dsl

const val NODE_TYPE_LABEL = "LABEL"
class LabelQueryNodeDto(val labelId: Long): QueryNodeDto(NODE_TYPE_LABEL)
