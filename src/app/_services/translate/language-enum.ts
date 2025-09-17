export enum LanguageEnum {
  POLISH = "pl",
  ENGLISH = "en"
}

export class LanguageEnumUtils {
  static getKey(value: string): string | undefined {
    let keys = Object.keys(LanguageEnum) as (keyof typeof LanguageEnum)[];
    return keys.find(key => LanguageEnum[key] === value);
  }

  static getValue(key: string): LanguageEnum | undefined {
    let values = Object.values(LanguageEnum) as string[];
    return values.includes(key)
      ? (key as LanguageEnum)
      : undefined;
  }
}
