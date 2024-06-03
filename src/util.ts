import { ParserServices, TSESTree } from "@typescript-eslint/utils";
import ts from "typescript";

export type Checker = ts.TypeChecker & {
  getElementTypeOfArrayType: (type: ts.Type) => ts.Type | undefined;
  getPromisedTypeOfPromise: (type: ts.Type) => ts.Type | undefined;
};

export class TypeUtil {
  constructor(
    private checker: Checker,
    private parserServices: Partial<ParserServices>,
    private skipWords: string[],
  ) {}

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
    initType: ts.Type | undefined,
    idType: ts.Type | undefined,
    skipClass: boolean,
  ): false | "skip" | { property: string; objectName: string } => {

    if(typeof idType === "undefined" || typeof initType === "undefined") {
      return false
    }

    // Check if idType is a Union
    if (idType.isUnion()) {
      const result = idType.types.map((type) =>
        this.checkProperties(initType, type, skipClass),
      );
      const returnObjectFlag = result.find((res) => typeof res === "object");
      const returnFalseFlag = result.find((res) => res === false);
      return returnFalseFlag ?? returnObjectFlag ?? false;
    }

    if (
      [
        ts.TypeFlags.Any,
        ts.TypeFlags.Unknown,
        ts.TypeFlags.Never,
        ts.TypeFlags.NonPrimitive,
        ts.TypeFlags.TypeParameter,
      ].includes(idType.flags) ||
      [
        ts.TypeFlags.Void,
        ts.TypeFlags.Any,
        ts.TypeFlags.Unknown,
        ts.TypeFlags.Null,
        ts.TypeFlags.Undefined,
        ts.TypeFlags.Never,
      ].includes(initType.flags) ||
      initType.flags <= 2048
    ) {
      return false;
    }
    if (
      [
        ts.TypeFlags.Void,
        ts.TypeFlags.Enum,
        ts.TypeFlags.EnumLiteral,
        ts.TypeFlags.Void,
        ts.TypeFlags.Null,
        ts.TypeFlags.Undefined,
        ts.TypeFlags.VoidLike,
      ].includes(idType.flags) ||
      idType.flags <= 2048
    ) {
      return "skip";
    }

    // skipword
    const idTypeName = idType.aliasSymbol?.name ?? idType.symbol?.name ?? false;
    if (idTypeName && this.skipWords.includes(idTypeName)) {
      return false;
    }

    // circular structure
    if (idType === initType) {
      return false;
    }

    if (skipClass && initType.isClass()) {
      return false;
    }

    // Check if idType is an array
    if (this.checker.isArrayType(idType)) {
      const idElementType = this.checker.getElementTypeOfArrayType(idType);
      const initElementType = this.checker.getElementTypeOfArrayType(initType);
      if (!!initElementType && !!idElementType) {
        const retunObject = this.checkProperties(
          initElementType,
          idElementType,
          skipClass,
        );
        if (typeof retunObject === "object") {
          return retunObject;
        }
      }
      return false;
    }

    // check if idType is a tuple
    if (this.checker.isTupleType(idType)) {
      const idElements = this.checker.getTypeArguments(idType as any);
      const initElements = this.checker.getTypeArguments(initType as any);
      for (const [idx, initElement] of initElements.entries()) {
        const retunObject = this.checkProperties(
          initElement,
          idElements[idx],
          skipClass,
        );
        if (typeof retunObject === "object") {
          return retunObject;
        }
      }
      return false;
    }

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

        const retunObject = this.checkProperties(
          initPropType,
          idIndexType,
          skipClass,
        );
        if (typeof retunObject === "object") {
          return retunObject;
        }
      }
      return false;
    }

    const idProps = idType.getProperties();
    const initProps = initType.getProperties();
    const filterdIdProps = idProps.filter(
      (t) =>
        ![
          "constructor",
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
        ].includes(t.name),
    );

    if (filterdIdProps.length === 0) return false;

    const idPropsNames = idProps.map((prop) => prop.name);
    for (const initProp of initProps) {
      if (!idPropsNames.includes(initProp.name)) {
        return {
          objectName: "",
          property: initProp.name,
        };
      }
    }

    for (const prop of initProps) {
      const idProp = idProps.find((idProp) => idProp.name === prop.name);
      if (!prop.valueDeclaration || !idProp?.valueDeclaration) {
        return false;
      }
      const initPropType = this.checker.getTypeOfSymbolAtLocation(
        prop,
        prop.valueDeclaration,
      );
      const idPropType = this.checker.getTypeOfSymbolAtLocation(
        idProp,
        idProp.valueDeclaration,
      );

      const retunObject = this.checkProperties(
        initPropType,
        idPropType,
        skipClass,
      );
      if (typeof retunObject === "object") {
        return retunObject;
      }
    }

    return false;
  };
}
