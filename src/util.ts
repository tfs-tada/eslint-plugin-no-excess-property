import { ParserServices, TSESTree } from "@typescript-eslint/utils";
import ts from "typescript";

export type Checker = ts.TypeChecker & {
  getElementTypeOfArrayType: (type: ts.Type) => ts.Type | undefined;
  getPromisedTypeOfPromise: (type: ts.Type) => ts.Type | undefined;
};

type CheckResult = false | "skip" | { property: string; objectName: string };

const LITERAL_TYPE_FLAG =
  ts.TypeFlags.String |
  ts.TypeFlags.Number |
  ts.TypeFlags.Boolean |
  ts.TypeFlags.Enum |
  ts.TypeFlags.BigInt |
  ts.TypeFlags.StringLiteral |
  ts.TypeFlags.NumberLiteral |
  ts.TypeFlags.BooleanLiteral |
  ts.TypeFlags.EnumLiteral |
  ts.TypeFlags.BigIntLiteral;

const ID_ALLOW_TYPE_FLAG =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.NonPrimitive |
  ts.TypeFlags.TypeParameter;

const INIT_ALLOW_TYPE_FLAG =
  LITERAL_TYPE_FLAG |
  ts.TypeFlags.Void |
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Never;

const ID_SKIP_FLAG =
  LITERAL_TYPE_FLAG |
  ts.TypeFlags.Void |
  ts.TypeFlags.Enum |
  ts.TypeFlags.EnumLiteral |
  ts.TypeFlags.Void |
  ts.TypeFlags.Null |
  ts.TypeFlags.Never |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.VoidLike;

export class TypeUtil {
  constructor(
    private checker: Checker,
    private parserServices: Partial<ParserServices>,
    private skipWords: string[],
    private skipProperties: string[],
    private checkClass: boolean,
  ) {}

  private checkPropertiesCache = new Map<ts.Type, Map<ts.Type, CheckResult>>();

  findReturnStatements = (
    node: TSESTree.Statement,
  ): TSESTree.ReturnStatement[] => {
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
          !!childNode &&
          childNode?.type !== "ClassBody" &&
          childNode?.type !== "TSInterfaceBody" &&
          childNode?.type !== "TSModuleBlock"
            ? this.findReturnStatements(childNode)
            : [],
        );
    }
    if (node.type === "IfStatement") {
      return [
        this.findReturnStatements(node.consequent),
        node.alternate ? this.findReturnStatements(node.alternate) : undefined,
      ].flatMap((e) => e ?? []);
    }

    return [];
  };

  createJsxAttributeRecord = (
    attributes: (TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute)[],
  ): Record<string, ts.Type> => {
    const allProps: Record<string, ts.Type> = {};
    attributes.forEach((attribute) => {
      if (attribute.type === "JSXSpreadAttribute") {
        const attrNode = this.parserServices.esTreeNodeToTSNodeMap!.get(
          attribute.argument,
        );
        const attrType = this.checker.getTypeAtLocation(attrNode);
        attrType.getProperties().forEach((prop) => {
          allProps[prop.name] = this.checker.getTypeOfSymbolAtLocation(
            prop,
            attrNode,
          );
        });
      } else if (attribute.type === "JSXAttribute") {
        const attrName = attribute.name.name;
        if (typeof attrName !== "string") return;
        const attrNode =
          this.parserServices.esTreeNodeToTSNodeMap!.get(attribute);
        const attrType = this.checker.getTypeAtLocation(attrNode);
        allProps[attrName] = attrType;
      }
    });
    return allProps;
  };

  getReturnTypes = (
    node: TSESTree.VariableDeclarator | TSESTree.FunctionDeclaration,
  ): ts.Type[] => {
    const tsNode = this.parserServices.esTreeNodeToTSNodeMap!.get(node);
    const type = this.checker.getTypeAtLocation(tsNode);
    const signature = type.getCallSignatures();
    const returnRawTypes =
      signature?.map((sig) => this.checker.getReturnTypeOfSignature(sig)) ?? [];
    const returnTypes = returnRawTypes.map(
      (e) => this.checker.getPromisedTypeOfPromise(e) ?? e,
    );
    return returnTypes;
  };

  checkProperties = (
    initRawType: ts.Type,
    idRawType: ts.Type,
    messagePrefix: string,
  ): CheckResult => {
    // Check cache first
    const cachedResult = this.checkPropertiesCache
      .get(initRawType)
      ?.get(idRawType);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const initType =
      this.checker.getPromisedTypeOfPromise(initRawType) ?? initRawType;
    const idType =
      this.checker.getPromisedTypeOfPromise(idRawType) ?? idRawType;

    let result: CheckResult = false; // Initialize result

    // skipword
    const idRawTypeName = idRawType.aliasSymbol?.name ?? idRawType.symbol?.name;
    const idTypeName = idType.aliasSymbol?.name ?? idType.symbol?.name;
    const checkSkipWord = () => {
      if (
        (!!idTypeName && this.skipWords.includes(idTypeName)) ||
        (!!idRawTypeName && this.skipWords.includes(idRawTypeName))
      ) {
        return false;
      }
      return undefined; // Continue checks
    };

    const checkUnionTypes = () => {
      // Check if initType is a Union
      if (initType.isUnion()) {
        const results = initType.types.map((type) =>
          this.checkProperties(type, idType, messagePrefix),
        );
        const returnObjectFlag = results.find((res) => typeof res === "object");
        return returnObjectFlag ?? false;
      }

      // Check if idType is a Union
      if (idType.isUnion()) {
        const results = idType.types.map((type) =>
          this.checkProperties(initType, type, messagePrefix),
        );
        const returnObjectFlag = results.find((res) => typeof res === "object");
        const returnFalseFlag = results.find((res) => res === false);
        return returnFalseFlag ?? returnObjectFlag ?? false;
      }
      return undefined; // Continue checks
    };

    const checkBasicFlagsAndTypes = () => {
      if (
        !!(idType.flags & ID_ALLOW_TYPE_FLAG) ||
        !!(initType.flags & INIT_ALLOW_TYPE_FLAG)
      ) {
        return false;
      }
      if (!!(idType.flags & ID_SKIP_FLAG)) {
        return "skip";
      }

      // circular structure
      if (idType === initType) {
        return false;
      }

      if (!this.checkClass && initType.isClass()) {
        return false;
      }
      return undefined; // Continue checks
    };

    const checkArrayAndTuple = () => {
      // Check if idType is an array
      if (this.checker.isArrayType(idType)) {
        const idElementType = this.checker.getElementTypeOfArrayType(idType);
        const initElementTypes = [
          this.checker.getElementTypeOfArrayType(initType) ??
            this.checker.getTypeArguments(initType as any),
        ].flat();
        if (!!idElementType) {
          const results = initElementTypes.map((init) =>
            this.checkProperties(init, idElementType, `${messagePrefix}[]`),
          );
          const returnObjectFlag = results.find(
            (res) => typeof res === "object",
          );
          const returnFalseFlag = results.find((res) => res === false);
          return returnObjectFlag ?? returnFalseFlag ?? "skip";
        }
        return "skip";
      }

      // check if idType is a tuple
      if (this.checker.isTupleType(idType)) {
        const idElements = this.checker.getTypeArguments(idType as any);
        const initElements = this.checker.getTypeArguments(initType as any);
        if (idElements.length !== initElements.length) return "skip";
        const results = initElements.map((init, idx) =>
          this.checkProperties(
            init,
            idElements[idx],
            `${messagePrefix}[${idx}]`,
          ),
        );
        const returnObjectFlag = results.find((res) => typeof res === "object");
        const returnFalseFlag = results.find((res) => res === false);
        return returnObjectFlag ?? returnFalseFlag ?? "skip";
      }
      return undefined; // Continue checks
    };

    const checkMappedAndIndexTypes = () => {
      // check if idType has mapped properties
      // todo: nested union type check
      const indexTargets = idType.isUnionOrIntersection()
        ? idType.types
        : [idType];
      const templateCheckRes = indexTargets.map((indexTarget) => {
        // check if idType has mapped properties
        if (
          "indexInfos" in indexTarget &&
          Array.isArray(indexTarget.indexInfos)
        ) {
          const infos: any[] = indexTarget.indexInfos;
          const flags = infos.map((info) => info.keyType?.flags);
          // todo: template literal check
          if (flags.includes(ts.TypeFlags.TemplateLiteral)) return true;
        }
        return undefined;
      });
      if (templateCheckRes.includes(true)) return false;

      // Check if idType has an index signature
      const idIndexType =
        this.checker.getIndexTypeOfType(idType, ts.IndexKind.String) ??
        this.checker.getIndexTypeOfType(idType, ts.IndexKind.Number);
      if (!!idIndexType) {
        const initProps = initType.getProperties();
        for (const prop of initProps) {
          if (!prop.valueDeclaration) continue;
          const initPropType = this.checker.getTypeOfSymbolAtLocation(
            prop,
            prop.valueDeclaration,
          );
          if (!idIndexType) continue;

          const returnObject = this.checkProperties(
            initPropType,
            idIndexType,
            `${!!messagePrefix ? `${messagePrefix}.` : ""}${prop.name}`,
          );
          if (typeof returnObject === "object") {
            return returnObject;
          }
        }
        return false;
      }
      return undefined; // Continue checks
    };

    const checkObjectProperties = () => {
      const idProps = idType.getProperties();
      const initProps = initType.getProperties().filter((prop) => {
        if (this.skipProperties.includes(prop.name)) return false;
        if (!!prop.valueDeclaration) {
          if (
            ts.getCombinedModifierFlags(prop.valueDeclaration) ===
            ts.ModifierFlags.Private
          ) {
            return false;
          }
        }
        return true;
      });
      if (idType.symbol?.name === "Object") return false;
      if (idProps.length === 0) return false;

      const idPropsNames = new Set(idProps.map((prop) => prop.name)); // Use Set for faster lookup
      for (const initProp of initProps) {
        if (!idPropsNames.has(initProp.name)) {
          // Use Set.has
          return {
            objectName: "",
            property: `${!!messagePrefix ? `${messagePrefix}.` : ""}${initProp.name}`,
          };
        }
      }

      for (const prop of initProps) {
        const idProp = idProps.find((idProp) => idProp.name === prop.name);
        if (!prop.valueDeclaration || !idProp?.valueDeclaration) {
          return false; // Or handle differently?
        }
        const initPropType = this.checker.getTypeOfSymbolAtLocation(
          prop,
          prop.valueDeclaration,
        );
        const idPropType = this.checker.getTypeOfSymbolAtLocation(
          idProp,
          idProp.valueDeclaration,
        );

        const returnObject = this.checkProperties(
          initPropType,
          idPropType,
          `${!!messagePrefix ? `${messagePrefix}.` : ""}${prop.name}`,
        );
        if (typeof returnObject === "object") {
          return returnObject;
        }
      }

      return false;
    };

    // Execute checks sequentially
    result =
      checkSkipWord() ??
      checkUnionTypes() ??
      checkBasicFlagsAndTypes() ??
      checkArrayAndTuple() ??
      checkMappedAndIndexTypes() ??
      checkObjectProperties();

    // Cache the result before returning
    if (!this.checkPropertiesCache.has(initRawType)) {
      this.checkPropertiesCache.set(
        initRawType,
        new Map<ts.Type, CheckResult>(),
      );
    }
    this.checkPropertiesCache.get(initRawType)!.set(idRawType, result);

    return result;
  };
}
