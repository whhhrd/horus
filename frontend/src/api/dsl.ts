import { LabelQueryNodeDto, OperatorQueryNodeDto } from "./types";

export function buildDSLQuery(root: LabelQueryNodeDto | OperatorQueryNodeDto): string {
    return JSON.stringify(root);
}
