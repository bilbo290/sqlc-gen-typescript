"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
const typescript_1 = require("typescript");
const utlis_1 = require("./utlis");
const logger_1 = require("../logger");
function funcParamsDecl(iface, params) {
    let funcParams = [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("sql"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Sql"), undefined), undefined),
    ];
    if (iface && params.length > 0) {
        funcParams.push(typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("args"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(iface), undefined), undefined));
    }
    return funcParams;
}
class Driver {
    columnType(column) {
        if (column === undefined || column.type === undefined) {
            return typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        }
        // Some of the type names have the `pgcatalog.` prefix. Remove this.
        let typeName = column.type.name;
        const pgCatalog = "pg_catalog.";
        if (typeName.startsWith(pgCatalog)) {
            typeName = typeName.slice(pgCatalog.length);
        }
        let typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword);
        switch (typeName) {
            case "aclitem": {
                // string
                break;
            }
            case "bigserial": {
                // string
                break;
            }
            case "bit": {
                // string
                break;
            }
            case "bool": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.BooleanKeyword);
                break;
            }
            case "box": {
                // string
                break;
            }
            case "bpchar": {
                // string
                break;
            }
            case "bytea": {
                // TODO: Is this correct or node-specific?
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "cid": {
                // string
                break;
            }
            case "cidr": {
                // string
                break;
            }
            case "circle": {
                // string
                break;
            }
            case "date": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "float4": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "float8": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "inet": {
                // string
                break;
            }
            case "int2": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "int4": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "int8": {
                // string
                break;
            }
            case "interval": {
                // string
                break;
            }
            case "json": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
                break;
            }
            case "jsonb": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
                break;
            }
            case "line": {
                // string
                break;
            }
            case "lseg": {
                // string
                break;
            }
            case "madaddr": {
                // string
                break;
            }
            case "madaddr8": {
                // string
                break;
            }
            case "money": {
                // string
                break;
            }
            case "oid": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "path": {
                // string
                break;
            }
            case "pg_node_tree": {
                // string
                break;
            }
            case "pg_snapshot": {
                // string
                break;
            }
            case "point": {
                // string
                break;
            }
            case "polygon": {
                // string
                break;
            }
            case "regproc": {
                // string
                break;
            }
            case "regrole": {
                // string
                break;
            }
            case "serial": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "serial2": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "serial4": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "serial8": {
                // string
                break;
            }
            case "smallserial": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "tid": {
                // string
                break;
            }
            case "text": {
                // string
                break;
            }
            case "time": {
                // string
                break;
            }
            case "timetz": {
                // string
                break;
            }
            case "timestamp": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "timestamptz": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "tsquery": {
                // string
                break;
            }
            case "tsvector": {
                // string
                break;
            }
            case "txid_snapshot": {
                // string
                break;
            }
            case "uuid": {
                // string
                break;
            }
            case "varbit": {
                // string
                break;
            }
            case "varchar": {
                // string
                break;
            }
            case "xid": {
                // string
                break;
            }
            case "xml": {
                // string
                break;
            }
            default: {
                (0, logger_1.log)(`unknown type ${column.type?.name}`);
                break;
            }
        }
        if (column.isArray || column.arrayDims > 0) {
            let dims = Math.max(column.arrayDims || 1);
            for (let i = 0; i < dims; i++) {
                typ = typescript_1.factory.createArrayTypeNode(typ);
            }
        }
        if (column.notNull) {
            return typ;
        }
        return typescript_1.factory.createUnionTypeNode([
            typ,
            typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull()),
        ]);
    }
    preamble(queries) {
        return [
            typescript_1.factory.createImportDeclaration(undefined, typescript_1.factory.createImportClause(false, undefined, typescript_1.factory.createNamedImports([
                typescript_1.factory.createImportSpecifier(false, undefined, typescript_1.factory.createIdentifier("Sql")),
            ])), typescript_1.factory.createStringLiteral("postgres"), undefined),
        ];
    }
    execDecl(funcName, queryName, argIface, params) {
        const funcParams = funcParamsDecl(argIface, params);
        return typescript_1.factory.createFunctionDeclaration([
            typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
            typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
        ], undefined, typescript_1.factory.createIdentifier(funcName), undefined, funcParams, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
            typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.VoidKeyword),
        ]), typescript_1.factory.createBlock([
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier("unsafe")), undefined, [
                typescript_1.factory.createIdentifier(queryName),
                typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false),
            ]))),
        ], true));
    }
    manyDecl(funcName, queryName, argIface, returnIface, params, columns) {
        const funcParams = funcParamsDecl(argIface, params);
        return typescript_1.factory.createFunctionDeclaration([
            typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
            typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
        ], undefined, typescript_1.factory.createIdentifier(funcName), undefined, funcParams, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
            typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined)),
        ]), typescript_1.factory.createBlock([
            typescript_1.factory.createReturnStatement(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier("unsafe")), undefined, [
                typescript_1.factory.createIdentifier(queryName),
                typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false),
            ]), typescript_1.factory.createIdentifier("values")), undefined, undefined)), typescript_1.factory.createIdentifier("map")), undefined, [
                typescript_1.factory.createArrowFunction(undefined, undefined, [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, "row"),
                ], undefined, typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsGreaterThanToken), typescript_1.factory.createObjectLiteralExpression(columns.map((col, i) => typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier((0, utlis_1.colName)(i, col)), typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("row"), typescript_1.factory.createNumericLiteral(`${i}`)))), true)),
            ])),
        ], true));
    }
    oneDecl(funcName, queryName, argIface, returnIface, params, columns) {
        const funcParams = funcParamsDecl(argIface, params);
        return typescript_1.factory.createFunctionDeclaration([
            typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
            typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
        ], undefined, typescript_1.factory.createIdentifier(funcName), undefined, funcParams, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
            typescript_1.factory.createUnionTypeNode([
                typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined),
                typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull()),
            ]),
        ]), typescript_1.factory.createBlock([
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("rows"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier("unsafe")), undefined, [
                    typescript_1.factory.createIdentifier(queryName),
                    typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false),
                ]), typescript_1.factory.createIdentifier("values")), undefined, undefined))),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("rows"), typescript_1.factory.createIdentifier("length")), typescript_1.factory.createToken(typescript_1.SyntaxKind.ExclamationEqualsEqualsToken), typescript_1.factory.createNumericLiteral("1")), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration("row", undefined, undefined, typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("rows"), typescript_1.factory.createNumericLiteral("0"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createIfStatement(typescript_1.factory.createPrefixUnaryExpression(typescript_1.SyntaxKind.ExclamationToken, typescript_1.factory.createIdentifier("row")), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createObjectLiteralExpression(columns.map((col, i) => typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier((0, utlis_1.colName)(i, col)), typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("row"), typescript_1.factory.createNumericLiteral(`${i}`)))), true)),
        ], true));
    }
    execlastidDecl(funcName, queryName, argIface, params) {
        throw new Error("postgres driver currently does not support :execlastid");
    }
}
exports.Driver = Driver;
