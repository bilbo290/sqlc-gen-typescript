"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// I cant' get this import to work locally. The import in node_modules is
// javy/dist but esbuild requires the import to be javy/fs
//
// @ts-expect-error
const fs_1 = require("javy/fs");
const typescript_1 = require("typescript");
const codegen_pb_1 = require("./gen/plugin/codegen_pb");
const utlis_1 = require("./drivers/utlis");
const better_sqlite3_1 = require("./drivers/better-sqlite3");
const pg_1 = require("./drivers/pg");
const postgres_1 = require("./drivers/postgres");
const mysql2_1 = require("./drivers/mysql2");
const cloudflare_d1_1 = require("./drivers/cloudflare-d1");
// Read input from stdin
const input = readInput();
// Call the function with the input
const result = codegen(input);
// Write the result to stdout
writeOutput(result);
function createNodeGenerator(options) {
    switch (options.driver) {
        case "mysql2": {
            return new mysql2_1.Driver(options.mysql2);
        }
        case "pg": {
            return new pg_1.Driver();
        }
        case "postgres": {
            return new postgres_1.Driver();
        }
        case "better-sqlite3": {
            return new better_sqlite3_1.Driver();
        }
        case "cloudflare-d1": {
            return new cloudflare_d1_1.Driver();
        }
    }
    throw new Error(`unknown driver: ${options.driver}`);
}
function codegen(input) {
    let files = [];
    let options = {};
    if (input.pluginOptions.length > 0) {
        const text = new TextDecoder().decode(input.pluginOptions);
        options = JSON.parse(text);
    }
    const driver = createNodeGenerator(options);
    // TODO: Verify options, parse them from protobuf honestly
    const querymap = new Map();
    for (const query of input.queries) {
        if (!querymap.has(query.filename)) {
            querymap.set(query.filename, []);
        }
        const qs = querymap.get(query.filename);
        qs?.push(query);
    }
    for (const [filename, queries] of querymap.entries()) {
        const nodes = driver.preamble(queries);
        for (const query of queries) {
            const colmap = new Map();
            for (let column of query.columns) {
                if (!column.name) {
                    continue;
                }
                const count = colmap.get(column.name) || 0;
                if (count > 0) {
                    column.name = `${column.name}_${count + 1}`;
                }
                colmap.set(column.name, count + 1);
            }
            const lowerName = query.name[0].toLowerCase() + query.name.slice(1);
            const textName = `${lowerName}Query`;
            nodes.push(queryDecl(textName, `-- name: ${query.name} ${query.cmd}
${query.text}`));
            let argIface = undefined;
            let returnIface = undefined;
            if (query.params.length > 0) {
                argIface = `${query.name}Args`;
                nodes.push(argsDecl(argIface, driver, query.params));
            }
            if (query.columns.length > 0) {
                returnIface = `${query.name}Row`;
                nodes.push(rowDecl(returnIface, driver, query.columns));
            }
            switch (query.cmd) {
                case ":exec": {
                    nodes.push(driver.execDecl(lowerName, textName, argIface, query.params));
                    break;
                }
                case ":execlastid": {
                    nodes.push(driver.execlastidDecl(lowerName, textName, argIface, query.params));
                    break;
                }
                case ":one": {
                    nodes.push(driver.oneDecl(lowerName, textName, argIface, returnIface ?? "void", query.params, query.columns));
                    break;
                }
                case ":many": {
                    nodes.push(driver.manyDecl(lowerName, textName, argIface, returnIface ?? "void", query.params, query.columns));
                    break;
                }
            }
            if (nodes) {
                files.push(new codegen_pb_1.File({
                    name: `${filename.replace(".", "_")}.ts`,
                    contents: new TextEncoder().encode(printNode(nodes)),
                }));
            }
        }
    }
    return new codegen_pb_1.GenerateResponse({
        files: files,
    });
}
// Read input from stdin
function readInput() {
    const buffer = (0, fs_1.readFileSync)(fs_1.STDIO.Stdin);
    return codegen_pb_1.GenerateRequest.fromBinary(buffer);
}
function queryDecl(name, sql) {
    return typescript_1.factory.createVariableStatement([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createVariableDeclarationList([
        typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier(name), undefined, undefined, typescript_1.factory.createNoSubstitutionTemplateLiteral(sql, sql)),
    ], typescript_1.NodeFlags.Const //| NodeFlags.Constant | NodeFlags.Constant
    ));
}
function argsDecl(name, driver, params) {
    return typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(name), undefined, undefined, params.map((param, i) => typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier((0, utlis_1.argName)(i, param.column)), undefined, driver.columnType(param.column))));
}
function rowDecl(name, driver, columns) {
    return typescript_1.factory.createInterfaceDeclaration([typescript_1.factory.createToken(typescript_1.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(name), undefined, undefined, columns.map((column, i) => typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier((0, utlis_1.colName)(i, column)), undefined, driver.columnType(column))));
}
function printNode(nodes) {
    // https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#creating-and-printing-a-typescript-ast
    const resultFile = (0, typescript_1.createSourceFile)("file.ts", "", typescript_1.ScriptTarget.Latest, 
    /*setParentNodes*/ false, typescript_1.ScriptKind.TS);
    const printer = (0, typescript_1.createPrinter)({ newLine: typescript_1.NewLineKind.LineFeed });
    let output = "// Code generated by sqlc. DO NOT EDIT.\n\n";
    for (let node of nodes) {
        output += printer.printNode(typescript_1.EmitHint.Unspecified, node, resultFile);
        output += "\n\n";
    }
    return output;
}
// Write output to stdout
function writeOutput(output) {
    const encodedOutput = output.toBinary();
    const buffer = new Uint8Array(encodedOutput);
    (0, fs_1.writeFileSync)(fs_1.STDIO.Stdout, buffer);
}
