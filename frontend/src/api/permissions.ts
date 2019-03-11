import {
    HorusResource,
    HorusResourceScope,
    HorusPermissionType,
    HorusAuthorityDto,
} from "../state/types";

function generatePermissionString(
    resource: HorusResource,
    scope: HorusResourceScope,
    type: HorusPermissionType,
): string {
    return `${resource}/${scope}/${type}`;
}

export default class CoursePermissions {
    private map: Map<number, Set<string>>;

    constructor(authorities: HorusAuthorityDto[]) {
        this.map = new Map<number, Set<string>>();
        authorities.forEach((authority) => {
            if (authority.courseIds == null) {
                return;
            }
            authority.courseIds.forEach((id) => {
                if (!this.map.has(id)) {
                    this.map.set(id, new Set());
                }
                this.map
                    .get(id)!
                    .add(
                        generatePermissionString(
                            authority.permission.resource,
                            authority.permission.scope,
                            authority.permission.type,
                        ),
                    );
            });
        });
    }

    allows(
        courseId: number,
        resource: HorusResource,
        scope: HorusResourceScope,
        type: HorusPermissionType,
    ): boolean {
        return (
            this.map.has(Number(courseId)) &&
            this.map
                .get(Number(courseId))!
                .has(generatePermissionString(resource, scope, type))
        );
    }

    allowsOwn(
        courseId: number,
        resource: HorusResource,
        type: HorusPermissionType,
    ): boolean {
        return (
            this.allows(courseId, resource, "OWN", type) ||
            this.allows(courseId, resource, "ANY", type)
        );
    }

    allowsAny(
        courseId: number,
        resource: HorusResource,
        type: HorusPermissionType,
    ): boolean {
        return this.allows(courseId, resource, "ANY", type);
    }
}

export type CourseAuthSchemeOp = "SOME" | "EVERY";

interface CourseAuthSchemeNode {
    resource: HorusResource;
    scope: HorusResourceScope;
    type: HorusPermissionType;
}
// tslint:disable: max-classes-per-file
export class CourseAuthScheme {
    static one(
        resource: HorusResource,
        scope: HorusResourceScope,
        type: HorusPermissionType,
    ): CourseAuthScheme {
        return new CourseAuthScheme({ resource, scope, type });
    }

    static some(...children: CourseAuthScheme[]) {
        return new CourseAuthScheme(null, "SOME", ...children);
    }

    static every(...children: CourseAuthScheme[]) {
        return new CourseAuthScheme(null, "EVERY", ...children);
    }

    static any(resource: HorusResource, type: HorusPermissionType) {
        return CourseAuthScheme.one(resource, "ANY", type);
    }

    static own(resource: HorusResource, type: HorusPermissionType) {
        return CourseAuthScheme.one(resource, "OWN", type);
    }

    static anyList(resource: HorusResource) {
        return CourseAuthScheme.any(resource, "LIST");
    }

    static anyView(resource: HorusResource) {
        return CourseAuthScheme.any(resource, "VIEW");
    }

    static anyCreate(resource: HorusResource) {
        return CourseAuthScheme.any(resource, "CREATE");
    }

    static anyEdit(resource: HorusResource) {
        return CourseAuthScheme.any(resource, "EDIT");
    }

    static anyDelete(resource: HorusResource) {
        return CourseAuthScheme.any(resource, "DELETE");
    }

    static ownList(resource: HorusResource) {
        return CourseAuthScheme.own(resource, "LIST");
    }

    static ownView(resource: HorusResource) {
        return CourseAuthScheme.own(resource, "VIEW");
    }

    static ownEdit(resource: HorusResource) {
        return CourseAuthScheme.own(resource, "EDIT");
    }

    private node: null | CourseAuthSchemeNode;
    private children: CourseAuthScheme[];
    private op: CourseAuthSchemeOp;

    private constructor(
        node: CourseAuthSchemeNode | null = null,
        op: CourseAuthSchemeOp = "EVERY",
        ...children: CourseAuthScheme[]
    ) {
        this.node = node;
        this.op = op;
        this.children = children;
    }

    check(courseId: number, permissions: CoursePermissions): boolean {
        let valid = true;

        if (this.node != null) {
            switch (this.node.scope) {
                case "ANY":
                    valid = permissions.allowsAny(
                        courseId,
                        this.node.resource,
                        this.node.type,
                    );
                    break;
                case "OWN":
                    valid = permissions.allowsOwn(
                        courseId,
                        this.node.resource,
                        this.node.type,
                    );
            }
        }

        if (this.children.length > 0) {
            switch (this.op) {
                case "EVERY":
                    valid =
                        valid &&
                        this.children.every((child) =>
                            child.check(courseId, permissions),
                        );
                    break;
                case "SOME":
                    valid =
                        valid &&
                        this.children.some((child) =>
                            child.check(courseId, permissions),
                        );
            }
        }

        return valid;
    }
}
