"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
const typescript_1 = require("typescript");
const utlis_1 = require("./utlis");
const cloudflare_d1_management_1 = require("./cloudflare-d1-management");
function funcParamsDecl(iface, params) {
    let funcParams = [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
    ];
    if (iface && params.length > 0) {
        funcParams.push(typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("args"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(iface), undefined), undefined));
    }
    return funcParams;
}
class Driver {
    /**
     * Cloudflare D1 uses SQLite type system
     * {@link https://developers.cloudflare.com/d1/platform/data-types/}
     */
    columnType(column) {
        if (column === undefined || column.type === undefined) {
            return typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        }
        let typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword);
        switch (column.type.name.toLowerCase()) {
            case "int":
            case "integer":
            case "tinyint":
            case "smallint":
            case "mediumint":
            case "bigint":
            case "unsignedbigint":
            case "int2":
            case "int8": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword);
                break;
            }
            case "blob": {
                typ = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("ArrayBuffer"), undefined);
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
            case "text":
            case "varchar":
            case "char":
            case "string": {
                typ = typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword);
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
            typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("D1HttpClient"), undefined, undefined, [
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("accountId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("databaseId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("apiToken"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("fetch"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createTypeQueryNode(typescript_1.factory.createIdentifier("fetch"), undefined)),
            ]),
            // Add D1 API error type
            typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("D1Error"), undefined, undefined, [
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("code"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("message"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
            ]),
            // Add D1 API response type
            typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("D1Result"), undefined, undefined, [
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("results"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("success"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.BooleanKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("meta"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createTypeLiteralNode([
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("duration"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("changes"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("last_row_id"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
                ])),
            ]),
            typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("D1Response"), undefined, undefined, [
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("result"), undefined, typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Result"), undefined))),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("success"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.BooleanKeyword)),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("errors"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Error"), undefined))),
                typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("messages"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
            ]),
        ];
        // Add D1 database management types and functions
        imports.push(...(0, cloudflare_d1_management_1.generateManagementTypes)());
        imports.push(...(0, cloudflare_d1_management_1.generateManagementFunctions)());
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
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("databaseId")), typescript_1.factory.createTemplateTail("/query")),
                ])),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                typescript_1.factory.createIdentifier("url"),
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("POST")),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                            typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                        ])),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Content-Type"), typescript_1.factory.createStringLiteral("application/json")),
                    ], true)),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("body"), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("JSON"), typescript_1.factory.createIdentifier("stringify")), undefined, [
                        typescript_1.factory.createObjectLiteralExpression([
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                        ], true),
                    ])),
                ], true),
            ]))),
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
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("databaseId")), typescript_1.factory.createTemplateTail("/query")),
                ])),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("response"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                    typescript_1.factory.createIdentifier("url"),
                    typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("POST")),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                            ])),
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Content-Type"), typescript_1.factory.createStringLiteral("application/json")),
                        ], true)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("body"), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("JSON"), typescript_1.factory.createIdentifier("stringify")), undefined, [
                            typescript_1.factory.createObjectLiteralExpression([
                                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                            ], true),
                        ])),
                    ], true),
                ]))),
            ], typescript_1.NodeFlags.Const | typescript_1.NodeFlags.AwaitContext)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Response"), undefined))),
            ], typescript_1.NodeFlags.Const | typescript_1.NodeFlags.AwaitContext)),
            // Check for errors first
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPrefixUnaryExpression(typescript_1.SyntaxKind.ExclamationToken, typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("success"))), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createIdentifier("length")), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsEqualsToken), typescript_1.factory.createNumericLiteral("0"))), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createBinaryExpression(typescript_1.factory.createElementAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createNumericLiteral("0")), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsEqualsToken), typescript_1.factory.createIdentifier("undefined"))), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("results"), undefined, undefined, typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createElementAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createNumericLiteral("0")), typescript_1.factory.createIdentifier("results"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("results"), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsToken), typescript_1.factory.createIdentifier("undefined")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("results"), typescript_1.factory.createIdentifier("length")), typescript_1.factory.createToken(typescript_1.SyntaxKind.ExclamationEqualsEqualsToken), typescript_1.factory.createNumericLiteral("1"))), typescript_1.factory.createBlock([typescript_1.factory.createReturnStatement(typescript_1.factory.createNull())], true), undefined),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createElementAccessExpression(typescript_1.factory.createIdentifier("results"), typescript_1.factory.createNumericLiteral("0")), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined))),
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
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("databaseId")), typescript_1.factory.createTemplateTail("/query")),
                ])),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("response"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                    typescript_1.factory.createIdentifier("url"),
                    typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("POST")),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                            ])),
                            typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Content-Type"), typescript_1.factory.createStringLiteral("application/json")),
                        ], true)),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("body"), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("JSON"), typescript_1.factory.createIdentifier("stringify")), undefined, [
                            typescript_1.factory.createObjectLiteralExpression([
                                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("sql"), typescript_1.factory.createIdentifier(queryName)),
                                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createArrayLiteralExpression(params.map((param, i) => typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("args"), typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)))), false)),
                            ], true),
                        ])),
                    ], true),
                ]))),
            ], typescript_1.NodeFlags.Const | typescript_1.NodeFlags.AwaitContext)),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Response"), undefined))),
            ], typescript_1.NodeFlags.Const | typescript_1.NodeFlags.AwaitContext)),
            // Check for errors or empty result
            typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPrefixUnaryExpression(typescript_1.SyntaxKind.ExclamationToken, typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("success"))), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createIdentifier("length")), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsEqualsToken), typescript_1.factory.createNumericLiteral("0"))), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createBinaryExpression(typescript_1.factory.createElementAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createNumericLiteral("0")), typescript_1.factory.createToken(typescript_1.SyntaxKind.EqualsEqualsEqualsToken), typescript_1.factory.createIdentifier("undefined"))), typescript_1.factory.createBlock([
                typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createArrayLiteralExpression([], false), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined)))),
            ], true), undefined),
            typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
                typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("results"), undefined, undefined, typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createElementAccessExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createNumericLiteral("0")), typescript_1.factory.createIdentifier("results"))),
            ], typescript_1.NodeFlags.Const)),
            typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("results"), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createArrayLiteralExpression([], false)), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(returnIface), undefined)))),
        ], true));
    }
    execlastidDecl(funcName, queryName, argIface, params) {
        throw new Error("cloudflare-d1 driver currently does not support :execlastid");
    }
}
exports.Driver = Driver;
