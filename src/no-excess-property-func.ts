import { ESLintUtils } from "@typescript-eslint/utils";
import ts from "typescript";
import { ReturnStatement, Statement } from "estree";
import { TypeUtil } from "./util";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://npmjs.com/package/${name}`
);

export = createRule({
  create(context) {
    const parserServices = context.sourceCode.parserServices;
    const checker =
      parserServices?.program?.getTypeChecker() as ts.TypeChecker & {
        getElementTypeOfArrayType: (type: ts.Type) => ts.Type | undefined;
        getPromisedTypeOfPromise: (type: ts.Type) => ts.Type | undefined;
      };

    if (!checker || !parserServices) return {};
    const typeUtil = new TypeUtil(checker);

    const findReturnStatements = (node: Statement): ReturnStatement[] => {
      if (node.type === "ReturnStatement") {
        return [node];
      }

      if (node.type === "FunctionDeclaration") {
        return [];
      }

      if ("body" in node) {
        return [node.body]
          .flat(2)
          .flatMap((childNode) =>
            childNode.type !== "ClassBody"
              ? findReturnStatements(childNode)
              : []
          );
      }
      if (node.type === "IfStatement") {
        return [
          findReturnStatements(node.consequent),
          node.alternate ? findReturnStatements(node.alternate) : undefined,
        ].flatMap((e) => e ?? []);
      }

      return [];
    };

    return {
      FunctionDeclaration(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node);
        const type = checker.getTypeAtLocation(tsNode);
        const signature = type.getCallSignatures();
        const returnRawTypes =
          signature?.map((sig) => checker.getReturnTypeOfSignature(sig)) ?? [];
        const returnTypes = returnRawTypes.map(
          (e) => checker.getPromisedTypeOfPromise(e) ?? e
        );

        if (returnTypes.length > 0) {
          const returnStatements = node.body.body
            .map((e) => findReturnStatements(e as any))
            .flat();
          for (const returnStatement of returnStatements) {
            if (!returnStatement.argument) return;
            const returnStatementNode = checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap!.get(
                returnStatement.argument as any
              )
            );

            if (
              returnTypes.every((type) =>
                typeUtil.checkProperties(returnStatementNode, type, true)
              )
            ) {
              context.report({
                node: returnStatement as any,
                messageId: "no-excess-property-func",
              });
            }
          }
        }
      },
      VariableDeclarator(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node);
        const type = checker.getTypeAtLocation(tsNode);
        const signature = type.getCallSignatures();
        const returnRawTypes =
          signature?.map((sig) => checker.getReturnTypeOfSignature(sig)) ?? [];
        const returnTypes = returnRawTypes.map(
          (e) => checker.getPromisedTypeOfPromise(e) ?? e
        );

        if (returnTypes.length > 0) {
          if (
            node.init !== null &&
            "body" in node.init &&
            node.init.body.type === "BlockStatement"
          ) {
            const returnStatements = node.init.body.body
              .map((e) => findReturnStatements(e as any))
              .flat();
            for (const returnStatement of returnStatements) {
              if (!returnStatement.argument) return;
              const returnStatementRawNode = checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap!.get(
                  returnStatement.argument as any
                )
              );
              const returnStatementNode =
                checker.getPromisedTypeOfPromise(returnStatementRawNode) ??
                returnStatementRawNode;

              if (
                returnTypes.every((type) =>
                  typeUtil.checkProperties(returnStatementNode, type, true)
                )
              ) {
                context.report({
                  node: returnStatement as any,
                  messageId: "no-excess-property-func",
                });
              }
            }
            return;
          }
          if (node.init !== null && "body" in node.init) {
            const returnStatementRawNode = checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap!.get(node.init.body)
            );
            const returnStatementNode =
              checker.getPromisedTypeOfPromise(returnStatementRawNode) ??
              returnStatementRawNode;

            if (
              returnTypes.every((type) =>
                typeUtil.checkProperties(returnStatementNode, type, true)
              )
            ) {
              context.report({
                node,
                messageId: "no-excess-property-func",
              });
            }
          }
        }
      },
    };
  },
  meta: {
    type: "problem",
    docs: {
      description: "Disallow excess properties in object assignments",
    },
    messages: {
      "no-excess-property-func": "Object has property not present in type",
    },
    schema: [],
  },
  name: "no-excess-property-func",
  defaultOptions: [],
});
