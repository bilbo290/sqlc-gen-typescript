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
    const imports: Node[] = [
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
    ];

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
        factory.createUnionTypeNode([
          factory.createTypeReferenceNode(
            factory.createIdentifier(returnIface),
            undefined
          ),
          factory.createLiteralTypeNode(factory.createNull()),
        ]),
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
                  factory.createAwaitExpression(
                    factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("response"),
                        factory.createIdentifier("json")
                      ),
                      undefined,
                      undefined
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
              [factory.createReturnStatement(factory.createNull())],
              true
            ),
            undefined
          ),
          factory.createReturnStatement(
            factory.createAsExpression(
              factory.createElementAccessExpression(
                factory.createIdentifier("results"),
                factory.createNumericLiteral("0")
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(returnIface),
                undefined
              )
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
        factory.createArrayTypeNode(
          factory.createTypeReferenceNode(
            factory.createIdentifier(returnIface),
            undefined
          )
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
                  factory.createAwaitExpression(
                    factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("response"),
                        factory.createIdentifier("json")
                      ),
                      undefined,
                      undefined
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
            factory.createAsExpression(
              factory.createBinaryExpression(
                factory.createIdentifier("results"),
                factory.createToken(SyntaxKind.BarBarToken),
                factory.createArrayLiteralExpression([], false)
              ),
              factory.createArrayTypeNode(
                factory.createTypeReferenceNode(
                  factory.createIdentifier(returnIface),
                  undefined
                )
              )
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
