import { ESLintUtils } from "@typescript-eslint/utils";
import ts from "typescript";
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
      };

    if (!checker || !parserServices) return {};
    const typeUtil = new TypeUtil(checker);

    return {
      CallExpression(node) {
        for (const [idx, argument] of node.arguments.entries()) {
          const argNode = parserServices.esTreeNodeToTSNodeMap!.get(argument);
          const argType = checker.getTypeAtLocation(argNode);

          const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node.callee);
          const tsSignatures = checker
            .getTypeAtLocation(tsNode)
            .getCallSignatures();

          const result = tsSignatures.map((sigType) => {
            const tsType = sigType.getTypeParameterAtPosition(idx);
            try {
              return typeUtil.checkProperties(argType, tsType, true);
            } catch {
              return false;
            }
          });

          if (result.length > 0 && result.every((e) => typeof e === "object")) {
            const reportTarget = result.find(
              (e): e is { property: string; objectName: string } =>
                typeof e === "object"
            );
            context.report({
              node,
              messageId: "no-excess-property",
              data: {
                objectName: reportTarget?.objectName,
                excessProperty: reportTarget?.property,
              },
            });
          }
        }
      },

      VariableDeclarator(node) {
        if (
          !node.init ||
          !node.id.typeAnnotation ||
          !parserServices.esTreeNodeToTSNodeMap
        ) {
          return;
        }

        const initType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.init)
        );

        const idType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.id)
        );

        const excessPropertyData = typeUtil.checkProperties(
          initType,
          idType,
          true
        );
        if (typeof excessPropertyData === "object") {
          context.report({
            node,
            messageId: "no-excess-property",
            data: {
              excessProperty: excessPropertyData.property,
            },
          });
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
      "no-excess-property":
        "Object has property not present {{ excessProperty }} in type",
    },
    schema: [],
  },
  name: "no-excess-property",
  defaultOptions: [],
});
