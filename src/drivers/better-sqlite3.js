"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
const typescript_1 = require("typescript");
const utlis_1 = require("./utlis");
function funcParamsDecl(iface, params) {
    let funcParams = [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("database"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Database"), undefined), undefined),
    ];
    if (iface && params.length > 0) {
        funcParams.push(typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("args"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(iface), undefined), undefined));
    }
    return funcParams;
}
class Driver {
    /**
     * {@link https://github.com/WiseLibs/better-sqlite3/blob/v9.4.1/docs/api.md#binding-parameters}
     * {@link https://github.com/sqlc-dev/sqlc/blob/v1.25.0/internal/codegen/golang/sqlite_type.go}
     */
    columnType(column) {
        if (column === undefined || column.type === undefined) {
            return typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        }
        let typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        switch (column.type.name) {
            case "int":
            case "integer":
            case "tinyint":
            case "smallint":
            case "mediumint":
            case "bigint":
            case "unsignedbigint":
            case "int2":
            case "int8": {
                // TODO: Improve `BigInt` handling (https://github.com/WiseLibs/better-sqlite3/blob/v9.4.1/docs/integer.md)
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "blob": {
                // TODO: Is this correct or node-specific?
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "real":
            case "double":
            case "doubleprecision":
            case "float": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "boolean":
            case "bool": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.BooleanKeyword);
                break;
            }
            case "date":
            case "datetime":
            case "timestamp": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
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
        const imports = [
            typescript_1.factory.createImportDeclaration(undefined, typescript_1.factory.createImportClause(false, undefined, typescript_1.factory.createNamedImports([
                typescript_1.factory.createImportSpecifier(false, undefined, typescript_1.factory.createIdentifier("Database")),
            ])), typescript_1.factory.createStringLiteral("better-sqlite3"), undefined),
        ];
        return imports;
    }
    execDecl(funcName, queryName, argIface, params) {
        const funcParams = funcParamsDecl(argIface, params);
        return typescript_1.factory.createFunctionDeclaration([
            typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
            typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
        ], undefined, typescript_1.factory.createIdentifier(funcName), undefined, funcParams, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
            typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.VoidKeyword),
        ]), typescript_1.factory.createBlock([
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("stmt"), undefined, undefined, typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("database"), typescript_1.factory.createIdentifier("prepare")), undefined, [typescript_1.factory.createIdentifier(queryName)])),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                // NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                // NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("stmt"), typescript_1.factory.createIdentifier("run")), undefined, params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column))))))),
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
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("stmt"), undefined, undefined, typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("database"), typescript_1.factory.createIdentifier("prepare")), undefined, [typescript_1.factory.createIdentifier(queryName)])),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                // NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                // NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("result"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("stmt"), typescript_1.factory.createIdentifier("get")), undefined, params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column))))))),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("result"), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsToken), typescript_1.factory.createIdentifier("undefined")), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createIdentifier("result"), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined))),
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
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("stmt"), undefined, undefined, typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("database"), typescript_1.factory.createIdentifier("prepare")), undefined, [typescript_1.factory.createIdentifier(queryName)])),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                // NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                // NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("result"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("stmt"), typescript_1.factory.createIdentifier("all")), undefined, params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column))))))),
            ], typescript_1.NodeFlags.Const |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createIdentifier("result"), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined)))),
        ], true));
    }
    execlastidDecl(funcName, queryName, argIface, params) {
        throw new Error("better-sqlite3 driver currently does not support :execlastid");
    }
}
exports.Driver = Driver;
