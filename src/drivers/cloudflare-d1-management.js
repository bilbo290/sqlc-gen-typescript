"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateManagementFunctions = exports.generateManagementTypes = void 0;
const typescript_1 = require("typescript");
/**
 * Cloudflare D1 Database Management Functions
 *
 * These functions are automatically generated alongside your query code
 * to support multi-tenancy and database lifecycle management.
 *
 * @see https://developers.cloudflare.com/api/resources/d1/subresources/database/
 */
function generateManagementTypes() {
    const nodes = [];
    // D1Database interface
    nodes.push(typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("D1Database"), undefined, undefined, [
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("uuid"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("name"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("version"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("created_at"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("num_tables"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("file_size"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
    ]));
    // CreateDatabaseRequest interface
    nodes.push(typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("CreateDatabaseRequest"), undefined, undefined, [
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("name"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("primary_location_hint"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
    ]));
    // UpdateDatabaseRequest interface
    nodes.push(typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("UpdateDatabaseRequest"), undefined, undefined, [
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("name"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
    ]));
    // ListDatabasesOptions interface
    nodes.push(typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("ListDatabasesOptions"), undefined, undefined, [
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("page"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("per_page"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.NumberKeyword)),
        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("name"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword)),
    ]));
    return nodes;
}
exports.generateManagementTypes = generateManagementTypes;
function generateManagementFunctions() {
    const nodes = [];
    // createDatabase function
    nodes.push(typescript_1.factory.createFunctionDeclaration([
        typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
        typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
    ], undefined, typescript_1.factory.createIdentifier("createDatabase"), undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("request"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("CreateDatabaseRequest"), undefined), undefined),
    ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
        typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined),
    ]), typescript_1.factory.createBlock([
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateTail("/d1/database")),
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
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("body"), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("JSON"), typescript_1.factory.createIdentifier("stringify")), undefined, [typescript_1.factory.createIdentifier("request")])),
                ], true),
            ]))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined))),
    ], true)));
    // deleteDatabase function
    nodes.push(typescript_1.factory.createFunctionDeclaration([
        typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
        typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
    ], undefined, typescript_1.factory.createIdentifier("deleteDatabase"), undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("databaseId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword), undefined),
    ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
        typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.VoidKeyword),
    ]), typescript_1.factory.createBlock([
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createIdentifier("databaseId"), typescript_1.factory.createTemplateTail("")),
            ])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createExpressionStatement(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
            typescript_1.factory.createIdentifier("url"),
            typescript_1.factory.createObjectLiteralExpression([
                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("DELETE")),
                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                        typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                    ])),
                ], true)),
            ], true),
        ]))),
    ], true)));
    // updateDatabase function
    nodes.push(typescript_1.factory.createFunctionDeclaration([
        typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
        typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
    ], undefined, typescript_1.factory.createIdentifier("updateDatabase"), undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("databaseId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("request"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("UpdateDatabaseRequest"), undefined), undefined),
    ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
        typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined),
    ]), typescript_1.factory.createBlock([
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createIdentifier("databaseId"), typescript_1.factory.createTemplateTail("")),
            ])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("response"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                typescript_1.factory.createIdentifier("url"),
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("PATCH")),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                            typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                        ])),
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Content-Type"), typescript_1.factory.createStringLiteral("application/json")),
                    ], true)),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("body"), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("JSON"), typescript_1.factory.createIdentifier("stringify")), undefined, [typescript_1.factory.createIdentifier("request")])),
                ], true),
            ]))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined))),
    ], true)));
    // listDatabases function
    nodes.push(typescript_1.factory.createFunctionDeclaration([
        typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
        typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
    ], undefined, typescript_1.factory.createIdentifier("listDatabases"), undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("options"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("ListDatabasesOptions"), undefined), undefined),
    ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
        typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined)),
    ]), typescript_1.factory.createBlock([
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("params"), undefined, undefined, typescript_1.factory.createNewExpression(typescript_1.factory.createIdentifier("URLSearchParams"), undefined, [])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createToken(typescript_1.SyntaxKind.AmpersandAmpersandToken), typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("page"))), typescript_1.factory.createBlock([
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createIdentifier("append")), undefined, [
                typescript_1.factory.createStringLiteral("page"),
                typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("String"), undefined, [
                    typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("page")),
                ]),
            ])),
        ], true), undefined),
        typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createToken(typescript_1.SyntaxKind.AmpersandAmpersandToken), typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("per_page"))), typescript_1.factory.createBlock([
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createIdentifier("append")), undefined, [
                typescript_1.factory.createStringLiteral("per_page"),
                typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("String"), undefined, [
                    typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("per_page")),
                ]),
            ])),
        ], true), undefined),
        typescript_1.factory.createIfStatement(typescript_1.factory.createBinaryExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createToken(typescript_1.SyntaxKind.AmpersandAmpersandToken), typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("name"))), typescript_1.factory.createBlock([
            typescript_1.factory.createExpressionStatement(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createIdentifier("append")), undefined, [
                typescript_1.factory.createStringLiteral("name"),
                typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("options"), typescript_1.factory.createIdentifier("name")),
            ])),
        ], true), undefined),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("queryString"), undefined, undefined, typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("params"), typescript_1.factory.createIdentifier("toString")), undefined, [])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database")),
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createConditionalExpression(typescript_1.factory.createIdentifier("queryString"), typescript_1.factory.createToken(typescript_1.SyntaxKind.QuestionToken), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("?"), [
                    typescript_1.factory.createTemplateSpan(typescript_1.factory.createIdentifier("queryString"), typescript_1.factory.createTemplateTail("")),
                ]), typescript_1.factory.createToken(typescript_1.SyntaxKind.ColonToken), typescript_1.factory.createStringLiteral("")), typescript_1.factory.createTemplateTail("")),
            ])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("response"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                typescript_1.factory.createIdentifier("url"),
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("GET")),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                            typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                        ])),
                    ], true)),
                ], true),
            ]))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createArrayLiteralExpression([], false)), typescript_1.factory.createArrayTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined)))),
    ], true)));
    // getDatabase function
    nodes.push(typescript_1.factory.createFunctionDeclaration([
        typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword),
        typescript_1.factory.createToken(typescript_1.SyntaxKind.AsyncKeyword),
    ], undefined, typescript_1.factory.createIdentifier("getDatabase"), undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("client"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1HttpClient"), undefined), undefined),
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("databaseId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.StringKeyword), undefined),
    ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
        typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined),
    ]), typescript_1.factory.createBlock([
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("url"), undefined, undefined, typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("https://api.cloudflare.com/client/v4/accounts/"), [
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("accountId")), typescript_1.factory.createTemplateMiddle("/d1/database/")),
                typescript_1.factory.createTemplateSpan(typescript_1.factory.createIdentifier("databaseId"), typescript_1.factory.createTemplateTail("")),
            ])),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("fetchFn"), undefined, undefined, typescript_1.factory.createBinaryExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("fetch")), typescript_1.factory.createToken(typescript_1.SyntaxKind.BarBarToken), typescript_1.factory.createIdentifier("fetch"))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("response"), undefined, undefined, typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("fetchFn"), undefined, [
                typescript_1.factory.createIdentifier("url"),
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral("GET")),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("headers"), typescript_1.factory.createObjectLiteralExpression([
                        typescript_1.factory.createPropertyAssignment(typescript_1.factory.createStringLiteral("Authorization"), typescript_1.factory.createTemplateExpression(typescript_1.factory.createTemplateHead("Bearer "), [
                            typescript_1.factory.createTemplateSpan(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("client"), typescript_1.factory.createIdentifier("apiToken")), typescript_1.factory.createTemplateTail("")),
                        ])),
                    ], true)),
                ], true),
            ]))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createVariableStatement(undefined, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier("data"), undefined, undefined, typescript_1.factory.createAsExpression(typescript_1.factory.createAwaitExpression(typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("response"), typescript_1.factory.createIdentifier("json")), undefined, undefined)), typescript_1.factory.createKeywordTypeNode(typescript_1.SyntaxKind.AnyKeyword))),
        ], typescript_1.NodeFlags.Const)),
        typescript_1.factory.createReturnStatement(typescript_1.factory.createAsExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier("data"), typescript_1.factory.createIdentifier("result")), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("D1Database"), undefined))),
    ], true)));
    return nodes;
}
exports.generateManagementFunctions = generateManagementFunctions;
