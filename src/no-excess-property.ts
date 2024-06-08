import ts from "typescript";
import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { Checker, TypeUtil } from "./util";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://npmjs.com/package/${name}`,
);

export = createRule({
  create(context) {
    const parserServices = context.sourceCode.parserServices;
    const checker = parserServices?.program?.getTypeChecker() as Checker;

    if (!checker || !parserServices) return {};
    const skipWords = context.options[0]?.skipWords ?? [];
    const typeUtil = new TypeUtil(checker, parserServices, skipWords);

    const checkReturnStatement = (
      returnStatements: TSESTree.ReturnStatement[],
      returnTypes: ts.Type[],
    ) => {
      for (const returnStatement of returnStatements) {
        if (!returnStatement.argument) return;
        const returnStatementNode = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap!.get(returnStatement.argument),
        );

        if (
          returnTypes.every(
            (type) =>
              typeof typeUtil.checkProperties(
                returnStatementNode,
                type,
                true,
              ) === "object",
          )
        ) {
          context.report({
            node: returnStatement,
            messageId: "no-excess-property-func",
          });
        }
      }
    };

    return {
      FunctionDeclaration(node) {
        const returnTypes = typeUtil.getReturnTypes(node);
        if (returnTypes.length > 0) {
          const returnStatements = node.body.body
            .map((e) => typeUtil.findReturnStatements(e))
            .flat();
          checkReturnStatement(returnStatements, returnTypes);
        }
      },

      JSXOpeningElement(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node);
        const tagNameNode = tsNode.tagName;
        const componentSymbol = checker.getSymbolAtLocation(tagNameNode);
        if (!componentSymbol) {
          return;
        }
        const componentType = checker.getTypeOfSymbolAtLocation(
          componentSymbol,
          tagNameNode,
        );
        const jsxSignatures = componentType.getCallSignatures();
        const allProps: Record<string, ts.Type> = {};
        node.attributes.forEach((attribute) => {
          if (attribute.type === "JSXSpreadAttribute") {
            const attrNode = parserServices.esTreeNodeToTSNodeMap!.get(
              attribute.argument,
            );
            const attrType = checker.getTypeAtLocation(attrNode);
            attrType.getProperties().forEach((prop) => {
              allProps[prop.name] = checker.getTypeOfSymbolAtLocation(
                prop,
                attrNode,
              );
            });
          } else if (attribute.type === "JSXAttribute") {
            const attrName = attribute.name.name;
            if (typeof attrName !== "string") return;
            const attrNode =
              parserServices.esTreeNodeToTSNodeMap!.get(attribute);
            const attrType = checker.getTypeAtLocation(attrNode);
            allProps[attrName] = attrType;
          }
        });

        const result = jsxSignatures
          .map((sigType) => {
            if (sigType.parameters.length === 0) return "skip";
            const idTypeParent = sigType.getTypeParameterAtPosition(0);
            const propertiesList = idTypeParent.isUnion()
              ? idTypeParent.types
              : [idTypeParent];
            return propertiesList.map((idType) => {
              const idTypeProperties = idType.getProperties();
              const checkResult = Object.entries(allProps).map(
                ([key, initType]) => {
                  const idNode = idTypeProperties.find((e) => e.name === key);
                  if (!idNode) return { property: key, objectName: "" };
                  const idType = checker.getTypeOfSymbolAtLocation(
                    idNode,
                    tsNode,
                  );
                  return typeUtil.checkProperties(initType, idType, true);
                },
              );
              return checkResult.some((e) => typeof e === "object")
                ? checkResult.find(
                    (e): e is { property: string; objectName: string } =>
                      typeof e === "object",
                  )
                : false;
            });
          })
          .flat()
          .filter((e) => e !== "skip");

        if (result.length > 0 && result.every((e) => typeof e === "object")) {
          const reportTarget = result.find(
            (e): e is { property: string; objectName: string } =>
              typeof e === "object",
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
      },

      CallExpression(node) {
        for (const [idx, argument] of node.arguments.entries()) {
          const argNode = parserServices.esTreeNodeToTSNodeMap!.get(argument);
          const argType = checker.getTypeAtLocation(argNode);

          const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node.callee);
          const tsSignatures = checker
            .getTypeAtLocation(tsNode)
            .getCallSignatures();

          const result = tsSignatures
            .map((sigType) => {
              const tsType = sigType.getTypeParameterAtPosition(idx);
              return typeUtil.checkProperties(argType, tsType, true);
            })
            .filter((e) => e !== "skip");

          if (result.length > 0 && result.every((e) => typeof e === "object")) {
            const reportTarget = result.find(
              (e): e is { property: string; objectName: string } =>
                typeof e === "object",
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
        const returnTypes = typeUtil.getReturnTypes(node);

        if (returnTypes.length > 0) {
          if (
            node.init !== null &&
            "body" in node.init &&
            node.init.body.type === "BlockStatement"
          ) {
            const returnStatements = node.init.body.body
              .map((e) => typeUtil.findReturnStatements(e))
              .flat();
            checkReturnStatement(returnStatements, returnTypes);
            return;
          }
          if (node.init !== null && "body" in node.init) {
            const returnStatementNode = checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap!.get(node.init.body),
            );

            if (
              returnTypes.every(
                (type) =>
                  typeof typeUtil.checkProperties(
                    returnStatementNode,
                    type,
                    true,
                  ) === "object",
              )
            ) {
              context.report({
                node,
                messageId: "no-excess-property-func",
              });
            }
          }
        }

        if (
          !node.init ||
          !node.id.typeAnnotation ||
          !parserServices.esTreeNodeToTSNodeMap
        ) {
          return;
        }

        const initType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.init),
        );

        const idType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.id),
        );

        const excessPropertyData = typeUtil.checkProperties(
          initType,
          idType,
          true,
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
      "no-excess-property-func": "Object has property not present in type",
    },
    schema: [
      {
        type: "object",
        properties: {
          skipWords: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  name: "no-excess-property",
  defaultOptions: [{ skipWords: [] as string[] }],
});
