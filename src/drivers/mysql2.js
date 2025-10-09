"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
const typescript_1 = require("typescript");
const utlis_1 = require("./utlis");
function funcParamsDecl(iface, params) {
    let funcParams = [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Client"), undefined), undefined),
    ];
    if (iface && params.length > 0) {
        funcParams.push(typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("args"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(iface), undefined), undefined));
    }
    return funcParams;
}
class Driver {
    constructor(options) {
        this.options = options ?? {};
    }
    columnType(column) {
        if (column === undefined || column.type === undefined) {
            return typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        }
        let typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword);
        switch (column.type.name) {
            case "bigint": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                if (this.options.support_big_numbers) {
                    if (this.options.big_number_strings) {
                        typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword);
                    }
                    else {
                        typ = typescript_1.factory.createUnionTypeNode([
                            typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword),
                            typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)
                        ]);
                    }
                }
                break;
            }
            case "binary": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "bit": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "blob": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "char": {
                // string
                break;
            }
            case "date": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "datetime": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "decimal": {
                // string
                break;
            }
            case "double": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "float": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "int": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "longblob": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "longtext": {
                // string
                break;
            }
            case "mediumblob": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "mediumint": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "mediumtext": {
                // string
                break;
            }
            case "smallint": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
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
            case "timestamp": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Date"), undefined);
                break;
            }
            case "tinyblob": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "tinyint": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "tinytext": {
                // string
                break;
            }
            case "json": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
                break;
            }
            case "varbinary": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Buffer"), undefined);
                break;
            }
            case "varchar": {
                // string
                break;
            }
            case "year": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            // default: {
            //   const output = new TextEncoder().encode(column.type.name + "\n");
            //   const buffer = new Uint8Array(output);
            //   writeFileSync(STDIO.Stderr, buffer);
            // }
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
        const hasExecLastIdCmd = queries.some((query) => query.cmd === ":execlastid");
        return [
            typescript_1.factory.createImportDeclaration(undefined, typescript_1.factory.createImportClause(false, typescript_1.factory.createIdentifier("mysql"), typescript_1.factory.createNamedImports([
                typescript_1.factory.createImportSpecifier(false, undefined, typescript_1.factory.createIdentifier("RowDataPacket")),
                ...(hasExecLastIdCmd
                    ? [
                        typescript_1.factory.createImportSpecifier(false, undefined, typescript_1.factory.createIdentifier("ResultSetHeader")),
                    ]
                    : []),
            ])), typescript_1.factory.createStringLiteral("mysql2/promise"), undefined),
            typescript_1.factory.createTypeAliasDeclaration(undefined, typescript_1.factory.createIdentifier("Client"), undefined, typescript_1.factory.createUnionTypeNode([
                typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("mysql"), typescript_1.factory.createIdentifier("Connection")), undefined),
                typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("mysql"), typescript_1.factory.createIdentifier("Pool")), undefined),
            ])),
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
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("query")), undefined, [
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("values"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                ], true),
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
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createArrayBindingPattern([
                    typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("rows"), undefined),
                ]), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("query")), [
                    typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("RowDataPacket"), undefined)),
                ], [
                    typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("values"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("rowsAsArray"), typescript_1.factory.createTrue()),
                    ], true),
                ]))),
            ], typescript_1.NodeFlags.Const |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("rows"), typescript_1.factory.createIdentifier("map")), undefined, [
                typescript_1.factory.createArrowFunction(undefined, undefined, [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("row"), undefined, undefined, undefined),
                ], undefined, typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsGreaterThanToken), typescript_1.factory.createBlock([
                    typescript_1.factory.createReturnStatement(typescript_1.factory.createObjectLiteralExpression(columns.map((col, i) => typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier((0, utlis_1.colName)(i, col)), typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("row"), typescript_1.factory.createNumericLiteral(`${i}`)))), true)),
                ], true)),
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
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createArrayBindingPattern([
                    typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("rows"), undefined),
                ]), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("query")), [
                    typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("RowDataPacket"), undefined)),
                ], [
                    typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("values"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("rowsAsArray"), typescript_1.factory.createTrue()),
                    ], true),
                ]))),
            ], typescript_1.NodeFlags.Const |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // ts.NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("rows"), typescript_1.factory.createIdentifier("length")), typescript_1.factory.createToken(typescript_1.SyntaxKind.ExclamationEqualsEqualsToken), typescript_1.factory.createNumericLiteral("1")), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("row"), undefined, undefined, typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("rows"), typescript_1.factory.createNumericLiteral("0"))),
            ], typescript_1.NodeFlags.Const |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createObjectLiteralExpression(columns.map((col, i) => typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier((0, utlis_1.colName)(i, col)), typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("row"), typescript_1.factory.createNumericLiteral(`${i}`)))), true)),
        ], true));
    }
    execlastidDecl(funcName, queryName, argIface, params) {
        const funcParams = funcParamsDecl(argIface, params);
        return typescript_1.factory.createFunctionDeclaration([
            typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
            typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
        ], undefined, typescript_1.factory.createIdentifier(funcName), undefined, funcParams, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
            typescript_1.factory.createTypeReferenceNode("number", undefined),
        ]), typescript_1.factory.createBlock([
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createArrayBindingPattern([
                    typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("result"), undefined),
                ]), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("query")), [
                    typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("ResultSetHeader"), undefined),
                ], [
                    typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("values"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                    ], true),
                ]))),
            ], typescript_1.NodeFlags.Const |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.AwaitContext |
                // NodeFlags.Constant |
                typescript_1.NodeFlags.ContextFlags |
                typescript_1.NodeFlags.TypeExcludesFlags)),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessChain(typescript_1.factory.createIdentifier("result"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionDotToken), typescript_1.factory.createIdentifier("insertId")), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionQuestionToken), typescript_1.factory.createNumericLiteral(0))),
        ], true));
    }
}
exports.Driver = Driver;
