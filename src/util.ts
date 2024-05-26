import ts from "typescript";

export type Checker = ts.TypeChecker & {
  getElementTypeOfArrayType: (type: ts.Type) => ts.Type | undefined;
};

export class TypeUtil {
  private checker: Checker;
  constructor(checker: Checker) {
    this.checker = checker;
  }
  checkProperties = (
    initType: ts.Type,
    idType: ts.Type,
    skipClass: boolean
  ): false | "skip" | { property: string; objectName: string } => {
    if (
      [
        ts.TypeFlags.Void,
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
        ts.TypeFlags.Never,
      ].includes(initType.flags) ||
      initType.flags <= 2048
    ) {
      return false;
    }
    if (
      [
        ts.TypeFlags.Enum,
        ts.TypeFlags.EnumLiteral,
        ts.TypeFlags.Void,
        ts.TypeFlags.Null,
        ts.TypeFlags.Undefined,
        ts.TypeFlags.VoidLike,
      ].includes(idType.flags)
    ) {
      return "skip";
    }

    // circular structure
    if (idType === initType) {
      return false;
    }

    // Skip if idType is a generic type
    if (
      "resolvedBaseConstraint" in idType ||
      "immediateBaseConstraint" in idType
    ) {
      return false;
    }

    // Check if idType is a Union
    if (idType.isUnion()) {
      const result = idType.types.map((type) =>
        this.checkProperties(initType, type, skipClass)
      );
      const returnObjectFlag = result.find((res) => typeof res === "object");
      const returnFalseFlag = result.find((res) => res === false);
      return returnFalseFlag ?? returnObjectFlag ?? false;
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
          skipClass
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
          skipClass
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
          prop.valueDeclaration
        );
        if (!idIndexType) continue;

        const retunObject = this.checkProperties(
          initPropType,
          idIndexType,
          skipClass
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
        ].includes(t.name)
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
        prop.valueDeclaration
      );
      const idPropType = this.checker.getTypeOfSymbolAtLocation(
        idProp,
        idProp.valueDeclaration
      );

      const retunObject = this.checkProperties(
        initPropType,
        idPropType,
        skipClass
      );
      if (typeof retunObject === "object") {
        return retunObject;
      }
    }

    return false;
  };
}
