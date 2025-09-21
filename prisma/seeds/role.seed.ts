import { Prisma, PrismaClient, RoleContext } from "@prisma/client";
import { systemRoles } from "../../src/constants";

export async function seedRoles(prisma: PrismaClient) {
    for (const role of systemRoles) {
        // Check if role already exists
        const existingRole = await prisma.role.findFirst({
            where: {
                name: role.name,
                context: role.context as RoleContext,
                contextId: role.contextId
            }
        });

        if (existingRole) {
            console.log(`Role ${role.name} already exists, skipping...`);
            continue;
        }

        let permissions;
        
        if (role.permissions.includes('*')) {
            const allPermissions = await prisma.permission.findMany();
            permissions = {
                connect: allPermissions.map((permission) => ({ id: permission.id }))
            };
        } else if (role.permissions.length > 0) {
            permissions = {
                connect: role.permissions.map((permission) => ({ id: permission }))
            };
        } else {
            // No permissions
            permissions = undefined;
        }

        await prisma.role.create({
            data: {
                name: role.name,
                description: role.description,
                context: role.context as RoleContext,
                contextId: role.contextId,
                isSystem: role.isSystem,
                permissions: permissions,
            },
        });
        
        console.log(`Created role: ${role.name}`);
    }
}