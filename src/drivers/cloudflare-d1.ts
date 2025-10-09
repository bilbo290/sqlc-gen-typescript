import {
  SyntaxKind,
  NodeFlags,
  Node,
  TypeNode,
  factory,
  FunctionDeclaration,
} from "typescript";

import { Parameter, Column, Query } from "../gen/plugin/codegen_pb";
import { argName, colName } from "./utlis";
import {
  generateManagementTypes,
  generateManagementFunctions,
} from "./cloudflare-d1-management";

function funcParamsDecl(iface: string | undefined, params: Parameter[]) {
  let funcParams = [
    factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier("client"),
      undefined,
      factory.createTypeReferenceNode(
        factory.createIdentifier("D1HttpClient"),
        undefined
      ),
      undefined
    ),
  ];

  if (iface && params.length > 0) {
    funcParams.push(
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("args"),
        undefined,
        factory.createTypeReferenceNode(
          factory.createIdentifier(iface),
          undefined
        ),
        undefined
      )
    );
  }

  return funcParams;
}

export class Driver {
  /**
   * Cloudflare D1 uses SQLite type system
   * {@link https://developers.cloudflare.com/d1/platform/data-types/}
   */
  columnType(column?: Column): TypeNode {
    if (column === undefined || column.type === undefined) {
      return factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
    }

    let typ: TypeNode = factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
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
        typ = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
        break;
      }
      case "blob": {
        typ = factory.createTypeReferenceNode(
          factory.createIdentifier("ArrayBuffer"),
          undefined
        );
        break;
      }
      case "real":
      case "double":
      case "doubleprecision":
      case "float": {
        typ = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
        break;
      }
      case "boolean":
      case "bool": {
        typ = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
        break;
      }
      case "date":
      case "datetime":
      case "timestamp": {
        typ = factory.createTypeReferenceNode(
          factory.createIdentifier("Date"),
          undefined
        );
        break;
      }
      case "text":
      case "varchar":
      case "char":
      case "string": {
        typ = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        break;
      }
    }

    if (column.notNull) {
      return typ;
    }

    return factory.createUnionTypeNode([
      typ,
      factory.createLiteralTypeNode(factory.createNull()),
    ]);
  }

  preamble(queries: Query[]) {
    // Use a version string instead of timestamp since WASM doesn't have real Date()
    const buildVersion = "v1.1.0-cloudflare-d1-error-result";
    const imports: Node[] = [
      // Add build version
      factory.createVariableStatement(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier("SQLC_GEN_TYPESCRIPT_VERSION"),
              undefined,
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              factory.createStringLiteral(buildVersion)
            ),
          ],
          NodeFlags.Const
        )
      ),
      factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("D1HttpClient"),
        undefined,
        undefined,
        [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("accountId"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("databaseId"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("apiToken"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("fetch"),
            factory.createToken(SyntaxKind.QuestionToken),
            factory.createTypeQueryNode(
              factory.createIdentifier("fetch"),
              undefined
            )
          ),
        ]
      ),
      // Add D1 API error type
      factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("D1Error"),
        undefined,
        undefined,
        [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("code"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("message"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
          ),
        ]
      ),
      // Add D1 QueryResult type for error handling
      factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("D1QueryResult"),
        [
          factory.createTypeParameterDeclaration(
            undefined,
            factory.createIdentifier("T"),
            undefined,
            undefined
          ),
        ],
        undefined,
        [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("data"),
            undefined,
            factory.createUnionTypeNode([
              factory.createTypeReferenceNode(
                factory.createIdentifier("T"),
                undefined
              ),
              factory.createLiteralTypeNode(factory.createNull()),
            ])
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("error"),
            undefined,
            factory.createUnionTypeNode([
              factory.createArrayTypeNode(
                factory.createTypeReferenceNode(
                  factory.createIdentifier("D1Error"),
                  undefined
                )
              ),
              factory.createLiteralTypeNode(factory.createNull()),
            ])
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("success"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword)
          ),
        ]
      ),
      // Add D1 API response type
      factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("D1Result"),
        undefined,
        undefined,
        [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("results"),
            factory.createToken(SyntaxKind.QuestionToken),
            factory.createArrayTypeNode(
              factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)
            )
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("success"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("meta"),
            factory.createToken(SyntaxKind.QuestionToken),
            factory.createTypeLiteralNode([
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("duration"),
                factory.createToken(SyntaxKind.QuestionToken),
                factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("changes"),
                factory.createToken(SyntaxKind.QuestionToken),
                factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("last_row_id"),
                factory.createToken(SyntaxKind.QuestionToken),
                factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
              ),
            ])
          ),
        ]
      ),
      factory.createInterfaceDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("D1Response"),
        undefined,
        undefined,
        [
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("result"),
            undefined,
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(
                factory.createIdentifier("D1Result"),
                undefined
              )
            )
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("success"),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword)
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("errors"),
            factory.createToken(SyntaxKind.QuestionToken),
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(
                factory.createIdentifier("D1Error"),
                undefined
              )
            )
          ),
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("messages"),
            factory.createToken(SyntaxKind.QuestionToken),
            factory.createArrayTypeNode(
              factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)
            )
          ),
        ]
      ),
    ];

    // Add D1 database management types and functions
    imports.push(...generateManagementTypes());
    imports.push(...generateManagementFunctions());

    return imports;
  }

  execDecl(
    funcName: string,
    queryName: string,
    argIface: string | undefined,
    params: Parameter[]
  ) {
    const funcParams = funcParamsDecl(argIface, params);

    return factory.createFunctionDeclaration(
      [
        factory.createToken(SyntaxKind.ExportKeyword),
        factory.createToken(SyntaxKind.AsyncKeyword),
      ],
      undefined,
      factory.createIdentifier(funcName),
      undefined,
      funcParams,
      factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
        factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
      ]),
      factory.createBlock(
        [
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("url"),
                  undefined,
                  undefined,
                  factory.createTemplateExpression(
                    factory.createTemplateHead(
                      "https://api.cloudflare.com/client/v4/accounts/"
                    ),
                    [
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("accountId")
                        ),
                        factory.createTemplateMiddle("/d1/database/")
                      ),
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("databaseId")
                        ),
                        factory.createTemplateTail("/query")
                      ),
                    ]
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("fetchFn"),
                  undefined,
                  undefined,
                  factory.createBinaryExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("client"),
                      factory.createIdentifier("fetch")
                    ),
                    factory.createToken(SyntaxKind.BarBarToken),
                    factory.createIdentifier("fetch")
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createExpressionStatement(
            factory.createAwaitExpression(
              factory.createCallExpression(
                factory.createIdentifier("fetchFn"),
                undefined,
                [
                  factory.createIdentifier("url"),
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier("method"),
                        factory.createStringLiteral("POST")
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("headers"),
                        factory.createObjectLiteralExpression(
                          [
                            factory.createPropertyAssignment(
                              factory.createStringLiteral("Authorization"),
                              factory.createTemplateExpression(
                                factory.createTemplateHead("Bearer "),
                                [
                                  factory.createTemplateSpan(
                                    factory.createPropertyAccessExpression(
                                      factory.createIdentifier("client"),
                                      factory.createIdentifier("apiToken")
                                    ),
                                    factory.createTemplateTail("")
                                  ),
                                ]
                              )
                            ),
                            factory.createPropertyAssignment(
                              factory.createStringLiteral("Content-Type"),
                              factory.createStringLiteral("application/json")
                            ),
                          ],
                          true
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("body"),
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("JSON"),
                            factory.createIdentifier("stringify")
                          ),
                          undefined,
                          [
                            factory.createObjectLiteralExpression(
                              [
                                factory.createPropertyAssignment(
                                  factory.createIdentifier("sql"),
                                  factory.createIdentifier(queryName)
                                ),
                                factory.createPropertyAssignment(
                                  factory.createIdentifier("params"),
                                  factory.createArrayLiteralExpression(
                                    params.map((param, i) =>
                                      factory.createPropertyAccessExpression(
                                        factory.createIdentifier("args"),
                                        factory.createIdentifier(
                                          argName(i, param.column)
                                        )
                                      )
                                    ),
                                    false
                                  )
                                ),
                              ],
                              true
                            ),
                          ]
                        )
                      ),
                    ],
                    true
                  ),
                ]
              )
            )
          ),
        ],
        true
      )
    );
  }

  oneDecl(
    funcName: string,
    queryName: string,
    argIface: string | undefined,
    returnIface: string,
    params: Parameter[],
    columns: Column[]
  ) {
    const funcParams = funcParamsDecl(argIface, params);

    return factory.createFunctionDeclaration(
      [
        factory.createToken(SyntaxKind.ExportKeyword),
        factory.createToken(SyntaxKind.AsyncKeyword),
      ],
      undefined,
      factory.createIdentifier(funcName),
      undefined,
      funcParams,
      factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
        factory.createTypeReferenceNode(
          factory.createIdentifier("D1QueryResult"),
          [
            factory.createTypeReferenceNode(
              factory.createIdentifier(returnIface),
              undefined
            ),
          ]
        ),
      ]),
      factory.createBlock(
        [
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("url"),
                  undefined,
                  undefined,
                  factory.createTemplateExpression(
                    factory.createTemplateHead(
                      "https://api.cloudflare.com/client/v4/accounts/"
                    ),
                    [
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("accountId")
                        ),
                        factory.createTemplateMiddle("/d1/database/")
                      ),
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("databaseId")
                        ),
                        factory.createTemplateTail("/query")
                      ),
                    ]
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("fetchFn"),
                  undefined,
                  undefined,
                  factory.createBinaryExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("client"),
                      factory.createIdentifier("fetch")
                    ),
                    factory.createToken(SyntaxKind.BarBarToken),
                    factory.createIdentifier("fetch")
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("response"),
                  undefined,
                  undefined,
                  factory.createAwaitExpression(
                    factory.createCallExpression(
                      factory.createIdentifier("fetchFn"),
                      undefined,
                      [
                        factory.createIdentifier("url"),
                        factory.createObjectLiteralExpression(
                          [
                            factory.createPropertyAssignment(
                              factory.createIdentifier("method"),
                              factory.createStringLiteral("POST")
                            ),
                            factory.createPropertyAssignment(
                              factory.createIdentifier("headers"),
                              factory.createObjectLiteralExpression(
                                [
                                  factory.createPropertyAssignment(
                                    factory.createStringLiteral(
                                      "Authorization"
                                    ),
                                    factory.createTemplateExpression(
                                      factory.createTemplateHead("Bearer "),
                                      [
                                        factory.createTemplateSpan(
                                          factory.createPropertyAccessExpression(
                                            factory.createIdentifier("client"),
                                            factory.createIdentifier("apiToken")
                                          ),
                                          factory.createTemplateTail("")
                                        ),
                                      ]
                                    )
                                  ),
                                  factory.createPropertyAssignment(
                                    factory.createStringLiteral("Content-Type"),
                                    factory.createStringLiteral(
                                      "application/json"
                                    )
                                  ),
                                ],
                                true
                              )
                            ),
                            factory.createPropertyAssignment(
                              factory.createIdentifier("body"),
                              factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("JSON"),
                                  factory.createIdentifier("stringify")
                                ),
                                undefined,
                                [
                                  factory.createObjectLiteralExpression(
                                    [
                                      factory.createPropertyAssignment(
                                        factory.createIdentifier("sql"),
                                        factory.createIdentifier(queryName)
                                      ),
                                      factory.createPropertyAssignment(
                                        factory.createIdentifier("params"),
                                        factory.createArrayLiteralExpression(
                                          params.map((param, i) =>
                                            factory.createPropertyAccessExpression(
                                              factory.createIdentifier("args"),
                                              factory.createIdentifier(
                                                argName(i, param.column)
                                              )
                                            )
                                          ),
                                          false
                                        )
                                      ),
                                    ],
                                    true
                                  ),
                                ]
                              )
                            ),
                          ],
                          true
                        ),
                      ]
                    )
                  )
                ),
              ],
              NodeFlags.Const | NodeFlags.AwaitContext
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("data"),
                  undefined,
                  undefined,
                  factory.createAsExpression(
                    factory.createAwaitExpression(
                      factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("response"),
                          factory.createIdentifier("json")
                        ),
                        undefined,
                        undefined
                      )
                    ),
                    factory.createTypeReferenceNode(
                      factory.createIdentifier("D1Response"),
                      undefined
                    )
                  )
                ),
              ],
              NodeFlags.Const | NodeFlags.AwaitContext
            )
          ),
          // Check for errors first
          factory.createIfStatement(
            factory.createBinaryExpression(
              factory.createBinaryExpression(
                factory.createPrefixUnaryExpression(
                  SyntaxKind.ExclamationToken,
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("data"),
                    factory.createIdentifier("success")
                  )
                ),
                factory.createToken(SyntaxKind.BarBarToken),
                factory.createBinaryExpression(
                  factory.createPropertyAccessExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("data"),
                      factory.createIdentifier("result")
                    ),
                    factory.createIdentifier("length")
                  ),
                  factory.createToken(SyntaxKind.EqualsEqualsEqualsToken),
                  factory.createNumericLiteral("0")
                )
              ),
              factory.createToken(SyntaxKind.BarBarToken),
              factory.createBinaryExpression(
                factory.createElementAccessExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("data"),
                    factory.createIdentifier("result")
                  ),
                  factory.createNumericLiteral("0")
                ),
                factory.createToken(SyntaxKind.EqualsEqualsEqualsToken),
                factory.createIdentifier("undefined")
              )
            ),
            factory.createBlock(
              [
                factory.createReturnStatement(
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier("data"),
                        factory.createNull()
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("error"),
                        factory.createBinaryExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("data"),
                            factory.createIdentifier("errors")
                          ),
                          factory.createToken(SyntaxKind.BarBarToken),
                          factory.createNull()
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("success"),
                        factory.createFalse()
                      ),
                    ],
                    true
                  )
                ),
              ],
              true
            ),
            undefined
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("results"),
                  undefined,
                  undefined,
                  factory.createPropertyAccessExpression(
                    factory.createElementAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("data"),
                        factory.createIdentifier("result")
                      ),
                      factory.createNumericLiteral("0")
                    ),
                    factory.createIdentifier("results")
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createIfStatement(
            factory.createBinaryExpression(
              factory.createBinaryExpression(
                factory.createIdentifier("results"),
                factory.createToken(SyntaxKind.EqualsEqualsToken),
                factory.createIdentifier("undefined")
              ),
              factory.createToken(SyntaxKind.BarBarToken),
              factory.createBinaryExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("results"),
                  factory.createIdentifier("length")
                ),
                factory.createToken(SyntaxKind.ExclamationEqualsEqualsToken),
                factory.createNumericLiteral("1")
              )
            ),
            factory.createBlock(
              [
                factory.createReturnStatement(
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier("data"),
                        factory.createNull()
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("error"),
                        factory.createNull()
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("success"),
                        factory.createFalse()
                      ),
                    ],
                    true
                  )
                ),
              ],
              true
            ),
            undefined
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("row"),
                  undefined,
                  undefined,
                  factory.createAsExpression(
                    factory.createElementAccessExpression(
                      factory.createIdentifier("results"),
                      factory.createNumericLiteral("0")
                    ),
                    factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createReturnStatement(
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier("data"),
                  factory.createObjectLiteralExpression(
                    columns.map((col, i) =>
                      factory.createPropertyAssignment(
                        factory.createIdentifier(colName(i, col)),
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("row"),
                          factory.createIdentifier(col.name)
                        )
                      )
                    ),
                    false
                  )
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier("error"),
                  factory.createNull()
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier("success"),
                  factory.createTrue()
                ),
              ],
              true
            )
          ),
        ],
        true
      )
    );
  }

  manyDecl(
    funcName: string,
    queryName: string,
    argIface: string | undefined,
    returnIface: string,
    params: Parameter[],
    columns: Column[]
  ) {
    const funcParams = funcParamsDecl(argIface, params);

    return factory.createFunctionDeclaration(
      [
        factory.createToken(SyntaxKind.ExportKeyword),
        factory.createToken(SyntaxKind.AsyncKeyword),
      ],
      undefined,
      factory.createIdentifier(funcName),
      undefined,
      funcParams,
      factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
        factory.createTypeReferenceNode(
          factory.createIdentifier("D1QueryResult"),
          [
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(
                factory.createIdentifier(returnIface),
                undefined
              )
            ),
          ]
        ),
      ]),
      factory.createBlock(
        [
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("url"),
                  undefined,
                  undefined,
                  factory.createTemplateExpression(
                    factory.createTemplateHead(
                      "https://api.cloudflare.com/client/v4/accounts/"
                    ),
                    [
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("accountId")
                        ),
                        factory.createTemplateMiddle("/d1/database/")
                      ),
                      factory.createTemplateSpan(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("client"),
                          factory.createIdentifier("databaseId")
                        ),
                        factory.createTemplateTail("/query")
                      ),
                    ]
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("fetchFn"),
                  undefined,
                  undefined,
                  factory.createBinaryExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("client"),
                      factory.createIdentifier("fetch")
                    ),
                    factory.createToken(SyntaxKind.BarBarToken),
                    factory.createIdentifier("fetch")
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("response"),
                  undefined,
                  undefined,
                  factory.createAwaitExpression(
                    factory.createCallExpression(
                      factory.createIdentifier("fetchFn"),
                      undefined,
                      [
                        factory.createIdentifier("url"),
                        factory.createObjectLiteralExpression(
                          [
                            factory.createPropertyAssignment(
                              factory.createIdentifier("method"),
                              factory.createStringLiteral("POST")
                            ),
                            factory.createPropertyAssignment(
                              factory.createIdentifier("headers"),
                              factory.createObjectLiteralExpression(
                                [
                                  factory.createPropertyAssignment(
                                    factory.createStringLiteral(
                                      "Authorization"
                                    ),
                                    factory.createTemplateExpression(
                                      factory.createTemplateHead("Bearer "),
                                      [
                                        factory.createTemplateSpan(
                                          factory.createPropertyAccessExpression(
                                            factory.createIdentifier("client"),
                                            factory.createIdentifier("apiToken")
                                          ),
                                          factory.createTemplateTail("")
                                        ),
                                      ]
                                    )
                                  ),
                                  factory.createPropertyAssignment(
                                    factory.createStringLiteral("Content-Type"),
                                    factory.createStringLiteral(
                                      "application/json"
                                    )
                                  ),
                                ],
                                true
                              )
                            ),
                            factory.createPropertyAssignment(
                              factory.createIdentifier("body"),
                              factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("JSON"),
                                  factory.createIdentifier("stringify")
                                ),
                                undefined,
                                [
                                  factory.createObjectLiteralExpression(
                                    [
                                      factory.createPropertyAssignment(
                                        factory.createIdentifier("sql"),
                                        factory.createIdentifier(queryName)
                                      ),
                                      factory.createPropertyAssignment(
                                        factory.createIdentifier("params"),
                                        factory.createArrayLiteralExpression(
                                          params.map((param, i) =>
                                            factory.createPropertyAccessExpression(
                                              factory.createIdentifier("args"),
                                              factory.createIdentifier(
                                                argName(i, param.column)
                                              )
                                            )
                                          ),
                                          false
                                        )
                                      ),
                                    ],
                                    true
                                  ),
                                ]
                              )
                            ),
                          ],
                          true
                        ),
                      ]
                    )
                  )
                ),
              ],
              NodeFlags.Const | NodeFlags.AwaitContext
            )
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("data"),
                  undefined,
                  undefined,
                  factory.createAsExpression(
                    factory.createAwaitExpression(
                      factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("response"),
                          factory.createIdentifier("json")
                        ),
                        undefined,
                        undefined
                      )
                    ),
                    factory.createTypeReferenceNode(
                      factory.createIdentifier("D1Response"),
                      undefined
                    )
                  )
                ),
              ],
              NodeFlags.Const | NodeFlags.AwaitContext
            )
          ),
          // Check for errors or empty result
          factory.createIfStatement(
            factory.createBinaryExpression(
              factory.createBinaryExpression(
                factory.createPrefixUnaryExpression(
                  SyntaxKind.ExclamationToken,
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("data"),
                    factory.createIdentifier("success")
                  )
                ),
                factory.createToken(SyntaxKind.BarBarToken),
                factory.createBinaryExpression(
                  factory.createPropertyAccessExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("data"),
                      factory.createIdentifier("result")
                    ),
                    factory.createIdentifier("length")
                  ),
                  factory.createToken(SyntaxKind.EqualsEqualsEqualsToken),
                  factory.createNumericLiteral("0")
                )
              ),
              factory.createToken(SyntaxKind.BarBarToken),
              factory.createBinaryExpression(
                factory.createElementAccessExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("data"),
                    factory.createIdentifier("result")
                  ),
                  factory.createNumericLiteral("0")
                ),
                factory.createToken(SyntaxKind.EqualsEqualsEqualsToken),
                factory.createIdentifier("undefined")
              )
            ),
            factory.createBlock(
              [
                factory.createReturnStatement(
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier("data"),
                        factory.createAsExpression(
                          factory.createArrayLiteralExpression([], false),
                          factory.createArrayTypeNode(
                            factory.createTypeReferenceNode(
                              factory.createIdentifier(returnIface),
                              undefined
                            )
                          )
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("error"),
                        factory.createBinaryExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("data"),
                            factory.createIdentifier("errors")
                          ),
                          factory.createToken(SyntaxKind.BarBarToken),
                          factory.createNull()
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier("success"),
                        factory.createFalse()
                      ),
                    ],
                    true
                  )
                ),
              ],
              true
            ),
            undefined
          ),
          factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier("results"),
                  undefined,
                  undefined,
                  factory.createPropertyAccessExpression(
                    factory.createElementAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("data"),
                        factory.createIdentifier("result")
                      ),
                      factory.createNumericLiteral("0")
                    ),
                    factory.createIdentifier("results")
                  )
                ),
              ],
              NodeFlags.Const
            )
          ),
          factory.createReturnStatement(
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier("data"),
                  factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createParenthesizedExpression(
                        factory.createBinaryExpression(
                          factory.createIdentifier("results"),
                          factory.createToken(SyntaxKind.BarBarToken),
                          factory.createArrayLiteralExpression([], false)
                        )
                      ),
                      factory.createIdentifier("map")
                    ),
                    undefined,
                    [
                      factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                          factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            factory.createIdentifier("row"),
                            undefined,
                            factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
                            undefined
                          ),
                        ],
                        undefined,
                        factory.createToken(SyntaxKind.EqualsGreaterThanToken),
                        factory.createParenthesizedExpression(
                          factory.createObjectLiteralExpression(
                            columns.map((col, i) =>
                              factory.createPropertyAssignment(
                                factory.createIdentifier(colName(i, col)),
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("row"),
                                  factory.createIdentifier(col.name)
                                )
                              )
                            ),
                            false
                          )
                        )
                      ),
                    ]
                  )
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier("error"),
                  factory.createNull()
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier("success"),
                  factory.createTrue()
                ),
              ],
              true
            )
          ),
        ],
        true
      )
    );
  }

  execlastidDecl(
    funcName: string,
    queryName: string,
    argIface: string | undefined,
    params: Parameter[]
  ): FunctionDeclaration {
    throw new Error(
      "cloudflare-d1 driver currently does not support :execlastid"
    );
  }
}
