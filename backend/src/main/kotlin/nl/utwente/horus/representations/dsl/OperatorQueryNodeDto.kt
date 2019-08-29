package nl.utwente.horus.representations.dsl

import nl.utwente.horus.entities.group.LabelFilterOperator

const val NODE_TYPE_OP = "OP"
class OperatorQueryNodeDto(val op: LabelFilterOperator, val children: List<QueryNodeDto>): QueryNodeDto(NODE_TYPE_OP)
