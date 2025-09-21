import { Prisma } from '@prisma/client';

/**
 * Format P2002 - Unique constraint violation error
 */
export function formatUniqueConstraintError(exception: Prisma.PrismaClientKnownRequestError): string {
  const target = exception.meta?.target as string[] | undefined;
  const modelName = exception.meta?.modelName as string | undefined;
  
  if (target && modelName) {
    const fields = target.join(', ');
    const modelDisplayName = modelName.toLowerCase().replace(/([A-Z])/g, ' $1').trim();
    
    // Handle common field mappings
    const fieldMappings: Record<string, string> = {
      email: 'email address',
      phone: 'phone number',
      slug: 'URL slug',
      name: 'name',
      username: 'username'
    };
    
    if (target.length === 1) {
      const field = target[0];
      const displayField = fieldMappings[field] || field;
      return `A ${modelDisplayName} with this ${displayField} already exists. Please choose a different ${displayField}.`;
    } else {
      return `A ${modelDisplayName} with this combination of ${fields} already exists. Please use different values.`;
    }
  }
  
  return 'This record already exists. Please check your input and try again.';
}

/**
 * Format P2003 - Foreign key constraint error
 */
export function formatForeignKeyError(exception: Prisma.PrismaClientKnownRequestError): string {
  const fieldName = exception.meta?.field_name as string | undefined;
  
  if (fieldName) {
    const displayField = fieldName.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `The referenced ${displayField} does not exist. Please provide a valid ${displayField} ID.`;
  }
  
  return 'Referenced record does not exist. Please check your input and try again.';
}

/**
 * Format P2025 - Record not found error
 */
export function formatRecordNotFoundError(exception: Prisma.PrismaClientKnownRequestError): string {
  const cause = exception.meta?.cause as string | undefined;
  
  if (cause) {
    // Extract model name from the cause if possible
    const modelMatch = cause.match(/No (\w+) found/);
    if (modelMatch) {
      const modelName = modelMatch[1].toLowerCase().replace(/([A-Z])/g, ' $1').trim();
      return `The requested ${modelName} was not found. It may have been deleted or you may not have permission to access it.`;
    }
  }
  
  return 'The requested record was not found. It may have been deleted or you may not have permission to access it.';
}

/**
 * Format P2000 - Value too long error
 */
export function formatValueTooLongError(exception: Prisma.PrismaClientKnownRequestError): string {
  const column = exception.meta?.column_name as string | undefined;
  
  if (column) {
    const displayField = column.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `The ${displayField} is too long. Please provide a shorter value.`;
  }
  
  return 'One of the provided values is too long. Please check your input and try again.';
}

/**
 * Format P2011 - Null constraint violation
 */
export function formatNullConstraintError(exception: Prisma.PrismaClientKnownRequestError): string {
  const column = exception.meta?.column_name as string | undefined;
  
  if (column) {
    const displayField = column.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `The ${displayField} is required and cannot be empty.`;
  }
  
  return 'A required field is missing. Please check your input and try again.';
}

/**
 * Format P2012 - Missing required value
 */
export function formatMissingRequiredError(exception: Prisma.PrismaClientKnownRequestError): string {
  const path = exception.meta?.path as string[] | undefined;
  
  if (path && path.length > 0) {
    const field = path[path.length - 1];
    const displayField = field.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `The ${displayField} is required. Please provide a value.`;
  }
  
  return 'A required field is missing. Please check your input and try again.';
}

/**
 * Format P2014 - Invalid ID error
 */
export function formatInvalidIdError(exception: Prisma.PrismaClientKnownRequestError): string {
  return 'The provided ID is invalid. Please check the ID format and try again.';
}

/**
 * Format P2016 - Query interpretation error
 */
export function formatQueryInterpretationError(exception: Prisma.PrismaClientKnownRequestError): string {
  return 'There was an error processing your request. Please check your input and try again.';
}

/**
 * Format P2021 - Table does not exist error
 */
export function formatTableNotExistError(exception: Prisma.PrismaClientKnownRequestError): string {
  const table = exception.meta?.table as string | undefined;
  
  if (table) {
    return `The ${table} resource is not available. Please contact support if this error persists.`;
  }
  
  return 'The requested resource is not available. Please contact support if this error persists.';
}

/**
 * Format P2022 - Column does not exist error
 */
export function formatColumnNotExistError(exception: Prisma.PrismaClientKnownRequestError): string {
  const column = exception.meta?.column as string | undefined;
  
  if (column) {
    return `The field '${column}' is not supported. Please check your request and try again.`;
  }
  
  return 'One of the requested fields is not supported. Please check your request and try again.';
}

// Legacy function for backward compatibility
export function formatForbiddenErrorMessage(errMsg: string) {
    const messageArr = errMsg.split('\n');
    const splittedByUnderscore = messageArr[messageArr.length - 1]?.split(
        '_'
    ) ?? ['', 'recordId'];
    const columnName = splittedByUnderscore[1];

    return `${columnName} already exists`;
}
